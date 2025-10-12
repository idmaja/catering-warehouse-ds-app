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

type MenuController struct {
	menuService service.MenuService
}

func NewMenuController(menuService service.MenuService) *MenuController {
	return &MenuController{menuService: menuService}
}

func (c *MenuController) CreateMenu(ctx *gin.Context) {
	var req request.CreateMenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create menu request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	menu, err := c.menuService.Create(ctx, req, username)
	if err != nil {
		utils.LogError("Failed to create menu", err, map[string]interface{}{"title": req.Title})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create menu", nil)
		return
	}
	utils.LogInfo("Menu created successfully", map[string]interface{}{"title": req.Title})
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "Menu created successfully", menu)
}

func (c *MenuController) FindAllMenus(ctx *gin.Context) {
	params := utils.GetPaginationParams(ctx, 10)
	search := ctx.Query("search")
	menus, total, err := c.menuService.FindAllWithPagination(ctx, params, search)
	if err != nil {
		utils.LogError("Failed to fetch menus", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to fetch menus", nil)
		return
	}

	paginatedResponse := utils.CreatePaginationResponse(menus, total, params)
	utils.LogInfo("Menus fetched successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Menus fetched successfully", paginatedResponse)
}

func (c *MenuController) FindMenuByID(ctx *gin.Context) {
	id := ctx.Param("id")
	menu, err := c.menuService.FindByID(ctx, id)
	if err != nil {
		utils.LogError("Failed to find menu", err, map[string]interface{}{"menu_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Menu not found", nil)
		return
	}
	utils.LogInfo("Menu found successfully", map[string]interface{}{"menu_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Menu found", menu)
}

func (c *MenuController) UpdateMenu(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.CreateMenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update menu request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.menuService.Update(ctx, id, req, username); err != nil {
		utils.LogError("Failed to update menu", err, map[string]interface{}{"menu_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Failed to update menu", nil)
		return
	}
	utils.LogInfo("Menu updated successfully", map[string]interface{}{"menu_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Menu updated successfully", nil)
}

func (c *MenuController) DeleteMenu(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.menuService.Delete(ctx, id, username); err != nil {
		utils.LogError("Failed to delete menu", err, map[string]interface{}{"menu_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Failed to delete menu", nil)
		return
	}

	utils.LogInfo("Menu deleted successfully", map[string]interface{}{"menu_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Menu deleted successfully", nil)
}