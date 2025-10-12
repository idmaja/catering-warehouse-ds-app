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

type CateringOrderController struct {
	cateringOrderService service.CateringOrderService
	telegramService      service.TelegramService
}

func NewCateringOrderController(cateringOrderService service.CateringOrderService, telegramService service.TelegramService) *CateringOrderController {
	return &CateringOrderController{
		cateringOrderService: cateringOrderService,
		telegramService:      telegramService,
	}
}

func (c *CateringOrderController) CreateCateringOrder(ctx *gin.Context) {
	var req request.CreateCateringOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create catering order request", map[string]interface{}{"error": err.Error()})
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

	order, err := c.cateringOrderService.CreateCateringOrder(ctx, req, username)
	if err != nil {
		utils.LogError("Failed to create catering order", err, map[string]interface{}{"customer": req.CustomerName})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create catering order", nil)
		return
	}

	utils.LogInfo("Catering order created successfully", map[string]interface{}{"order_number": order.OrderNumber})
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "Catering order created successfully", order)
}

func (c *CateringOrderController) GetAllCateringOrders(ctx *gin.Context) {
	page := ctx.DefaultQuery("page", "1")
	limit := ctx.DefaultQuery("limit", "10")
	status := ctx.Query("status")
	dateFilter := ctx.Query("date_filter")
	search := ctx.Query("search")
	
	orders, total, err := c.cateringOrderService.GetCateringOrdersWithFilters(ctx, page, limit, status, dateFilter, search)
	if err != nil {
		utils.LogError("Failed to retrieve catering orders", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to retrieve catering orders", nil)
		return
	}

	utils.LogInfo("Catering orders retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Catering orders retrieved successfully", gin.H{
		"orders": orders,
		"total":  total,
	})
}

func (c *CateringOrderController) GetCateringOrderByID(ctx *gin.Context) {
	id := ctx.Param("id")
	order, err := c.cateringOrderService.GetCateringOrderByID(ctx, id)
	if err != nil {
		utils.LogError("Failed to find catering order", err, map[string]interface{}{"order_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Catering order not found", nil)
		return
	}

	utils.LogInfo("Catering order found successfully", map[string]interface{}{"order_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Catering order found", order)
}

func (c *CateringOrderController) UpdateCateringOrderStatus(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.UpdateCateringOrderStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update catering order status request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.cateringOrderService.UpdateCateringOrderStatus(ctx, id, req, username); err != nil {
		utils.LogError("Failed to update catering order status", err, map[string]interface{}{"order_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to update catering order status", nil)
		return
	}

	utils.LogInfo("Catering order status updated successfully", map[string]interface{}{"order_id": id, "status": req.Status})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Catering order status updated successfully", nil)
}

func (c *CateringOrderController) DeleteCateringOrder(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.cateringOrderService.DeleteCateringOrder(ctx, id, username); err != nil {
		utils.LogError("Failed to delete catering order", err, map[string]interface{}{"order_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to delete catering order", nil)
		return
	}
	
	utils.LogInfo("Catering order deleted successfully", map[string]interface{}{"order_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Catering order deleted successfully", nil)
}