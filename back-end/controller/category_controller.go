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

type CategoryController struct {
	categoryService service.CategoryService
}

func NewCategoryController(categoryService service.CategoryService) *CategoryController {
	return &CategoryController{categoryService: categoryService}
}

func (c *CategoryController) GetAllCategories(ctx *gin.Context) {
	params := utils.GetPaginationParams(ctx, 10)
	categories, total, err := c.categoryService.GetAllCategoriesWithPagination(ctx, params)
	if err != nil {
		utils.LogError("Failed to retrieve categories", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to get categories", nil)
		return
	}
	paginatedResponse := utils.CreatePaginationResponse(categories, total, params)
	utils.LogInfo("Categories retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Categories retrieved successfully", paginatedResponse)
}

func (c *CategoryController) CreateCategory(ctx *gin.Context) {
	var req request.CreateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create category request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	category, err := c.categoryService.CreateCategory(ctx, &req, username)
	if err != nil {
		utils.LogError("Failed to create category", err, map[string]interface{}{"name": req.Name})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create category", nil)
		return
	}
	utils.LogInfo("Category created successfully", map[string]interface{}{"name": req.Name})
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "Category created successfully", category)
}

func (c *CategoryController) UpdateCategory(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.CreateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update category request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	err := c.categoryService.UpdateCategory(ctx, id, &req, username)
	if err != nil {
		utils.LogError("Failed to update category", err, map[string]interface{}{"category_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to update category", nil)
		return
	}
	utils.LogInfo("Category updated successfully", map[string]interface{}{"category_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Category updated successfully", nil)
}

func (c *CategoryController) DeleteCategory(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	err := c.categoryService.DeleteCategory(ctx, id, username)
	if err != nil {
		utils.LogError("Failed to delete category", err, map[string]interface{}{"category_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to delete category", nil)
		return
	}
	utils.LogInfo("Category deleted successfully", map[string]interface{}{"category_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Category deleted successfully", nil)
}