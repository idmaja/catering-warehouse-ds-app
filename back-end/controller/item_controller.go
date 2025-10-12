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

type ItemController struct {
	itemService service.ItemService
}

func NewItemController(itemService service.ItemService) *ItemController {
	return &ItemController{itemService: itemService}
}

func (c *ItemController) CreateItem(ctx *gin.Context) {
	var req request.CreateItemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create item request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	item, err := c.itemService.Create(ctx, req, username)
	if err != nil {
		utils.LogError("Failed to create item", err, map[string]interface{}{"name": req.Name})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create item", nil)
		return
	}
	utils.LogInfo("Item created successfully", map[string]interface{}{"name": req.Name})
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "Item created successfully", item)
}

func (c *ItemController) FindAllItems(ctx *gin.Context) {
	params := utils.GetPaginationParams(ctx, 10)
	search := ctx.Query("search")
	items, total, err := c.itemService.FindAllWithPagination(ctx, params, search)
	if err != nil {
		utils.LogError("Failed to fetch items", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to fetch items", nil)
		return
	}

	paginatedResponse := utils.CreatePaginationResponse(items, total, params)
	utils.LogInfo("Items fetched successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Items fetched successfully", paginatedResponse)
}

func (c *ItemController) FindItemByID(ctx *gin.Context) {
	id := ctx.Param("id")
	item, err := c.itemService.FindByID(ctx, id)
	if err != nil {
		utils.LogError("Failed to find item", err, map[string]interface{}{"item_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Item not found", nil)
		return
	}
	utils.LogInfo("Item found successfully", map[string]interface{}{"item_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Item found", item)
}

func (c *ItemController) UpdateItem(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.UpdateItemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update item request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.itemService.Update(ctx, id, req, username); err != nil {
		utils.LogError("Failed to update item", err, map[string]interface{}{"item_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Failed to update item", nil)
		return
	}
	utils.LogInfo("Item updated successfully", map[string]interface{}{"item_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Item updated successfully", nil)
}

func (c *ItemController) DeleteItem(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.itemService.Delete(ctx, id, username); err != nil {
		utils.LogError("Failed to delete item", err, map[string]interface{}{"item_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Failed to delete item", nil)
		return
	}

	utils.LogInfo("Item deleted successfully", map[string]interface{}{"item_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Item deleted successfully", nil)
}

func (c *ItemController) GetStats(ctx *gin.Context) {
	stats, err := c.itemService.GetStats(ctx)
	if err != nil {
		utils.LogError("Failed to get stats", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to get stats", nil)
		return
	}
	utils.LogInfo("Stats retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Stats retrieved successfully", stats)
}

func (c *ItemController) GenerateSKU(ctx *gin.Context) {
	sku := utils.GenerateSKU()
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "SKU generated successfully", map[string]string{"sku": sku})
}