package controller

import (
	"net/http"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/dto/response"
	"warehouse-trial-gin/service"
	"warehouse-trial-gin/utils"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

type OrderController struct {
	orderService    service.OrderService
	telegramService service.TelegramService
}

func NewOrderController(orderService service.OrderService, telegramService service.TelegramService) *OrderController {
	return &OrderController{
		orderService:    orderService,
		telegramService: telegramService,
	}
}

func (c *OrderController) CreateOrder(ctx *gin.Context) {
	var req request.CreateOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create order request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, exists := ctx.Get("claims")
	if !exists {
		response.RespondJSON(ctx.Writer, http.StatusUnauthorized, "error", "Unauthorized", nil)
		return
	}

	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	order, err := c.orderService.CreateOrder(ctx, req, username)
	if err != nil {
		utils.LogError("Failed to create order", err, map[string]interface{}{"type": req.Type})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create order", nil)
		return
	}

	utils.LogInfo("Order created successfully", map[string]interface{}{"order_number": order.OrderNumber})
	
	// Prepare order data for telegram notification
	orderData := map[string]interface{}{
		"order_number": order.OrderNumber,
		"type":         string(order.Type),
		"status":       string(order.Status),
		"total_amount": order.TotalAmount,
		"created_by":   username,
		"items":        order.Items,
	}
	go c.telegramService.SendOrderNotification(orderData)
	
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "Order created successfully", order)
}

func (c *OrderController) GetAllOrders(ctx *gin.Context) {
	// Get query parameters
	page := ctx.DefaultQuery("page", "1")
	limit := ctx.DefaultQuery("limit", "10")
	status := ctx.Query("status")
	orderType := ctx.Query("type")
	dateFilter := ctx.Query("date_filter")
	search := ctx.Query("search")
	
	orders, total, err := c.orderService.GetOrdersWithFilters(ctx, page, limit, status, orderType, dateFilter, search)
	if err != nil {
		utils.LogError("Failed to retrieve orders", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to retrieve orders", nil)
		return
	}

	utils.LogInfo("Orders retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Orders retrieved successfully", gin.H{
		"orders": orders,
		"total":  total,
	})
}

func (c *OrderController) GetOrderByID(ctx *gin.Context) {
	id := ctx.Param("id")
	order, err := c.orderService.GetOrderByID(ctx, id)
	if err != nil {
		utils.LogError("Failed to find order", err, map[string]interface{}{"order_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Order not found", nil)
		return
	}

	utils.LogInfo("Order found successfully", map[string]interface{}{"order_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Order found", order)
}

func (c *OrderController) UpdateOrderStatus(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.UpdateOrderStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update order status request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.orderService.UpdateOrderStatus(ctx, id, req, username); err != nil {
		utils.LogError("Failed to update order status", err, map[string]interface{}{"order_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to update order status", nil)
		return
	}

	utils.LogInfo("Order status updated successfully", map[string]interface{}{"order_id": id, "status": req.Status})
	
	order, _ := c.orderService.GetOrderByID(ctx, id)
	// Prepare updated order data for telegram notification
	orderData := map[string]interface{}{
		"order_number": order.OrderNumber,
		"type":         string(order.Type),
		"status":       req.Status,
		"total_amount": order.TotalAmount,
		"created_by":   username,
		"items":        order.Items,
	}
	go c.telegramService.SendOrderNotification(orderData)
	
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Order status updated successfully", nil)
}

func (c *OrderController) DeleteOrder(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	order, _ := c.orderService.GetOrderByID(ctx, id)
	
	if err := c.orderService.DeleteOrder(ctx, id, username); err != nil {
		utils.LogError("Failed to delete order", err, map[string]interface{}{"order_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to delete order", nil)
		return
	}
	
	utils.LogInfo("Order deleted successfully", map[string]interface{}{"order_id": id})
	if order != nil {
		utils.LogInfo("Sending delete notification", map[string]interface{}{"order_number": order.OrderNumber, "type": string(order.Type)})
		go c.telegramService.SendOrderDeleteNotification(order.OrderNumber, string(order.Type), string(order.Status))
	} else {
		utils.LogWarn("Order is nil, cannot send delete notification", map[string]interface{}{"order_id": id})
	}
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Order deleted successfully", nil)
}