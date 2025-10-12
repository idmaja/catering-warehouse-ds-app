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

type MenuCategoryController struct {
	menuCategoryService service.MenuCategoryService
}

func NewMenuCategoryController(menuCategoryService service.MenuCategoryService) *MenuCategoryController {
	return &MenuCategoryController{menuCategoryService: menuCategoryService}
}

func (c *MenuCategoryController) GetAllMenuCategories(ctx *gin.Context) {
	params := utils.GetPaginationParams(ctx, 10)
	categories, total, err := c.menuCategoryService.GetAllMenuCategoriesWithPagination(ctx, params)
	if err != nil {
		utils.LogError("Failed to retrieve menu categories", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to get menu categories", nil)
		return
	}
	paginatedResponse := utils.CreatePaginationResponse(categories, total, params)
	utils.LogInfo("Menu categories retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Menu categories retrieved successfully", paginatedResponse)
}

func (c *MenuCategoryController) CreateMenuCategory(ctx *gin.Context) {
	var req request.CreateMenuCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create menu category request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	category, err := c.menuCategoryService.CreateMenuCategory(ctx, &req, username)
	if err != nil {
		utils.LogError("Failed to create menu category", err, map[string]interface{}{"name": req.Name})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create menu category", nil)
		return
	}
	utils.LogInfo("Menu category created successfully", map[string]interface{}{"name": req.Name})
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "Menu category created successfully", category)
}

func (c *MenuCategoryController) UpdateMenuCategory(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.CreateMenuCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update menu category request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	err := c.menuCategoryService.UpdateMenuCategory(ctx, id, &req, username)
	if err != nil {
		utils.LogError("Failed to update menu category", err, map[string]interface{}{"category_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to update menu category", nil)
		return
	}
	utils.LogInfo("Menu category updated successfully", map[string]interface{}{"category_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Menu category updated successfully", nil)
}

func (c *MenuCategoryController) DeleteMenuCategory(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	err := c.menuCategoryService.DeleteMenuCategory(ctx, id, username)
	if err != nil {
		utils.LogError("Failed to delete menu category", err, map[string]interface{}{"category_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to delete menu category", nil)
		return
	}
	utils.LogInfo("Menu category deleted successfully", map[string]interface{}{"category_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Menu category deleted successfully", nil)
}