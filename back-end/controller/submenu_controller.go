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

type SubmenuController struct {
	submenuService service.SubmenuService
}

func NewSubmenuController(submenuService service.SubmenuService) *SubmenuController {
	return &SubmenuController{submenuService: submenuService}
}

func (c *SubmenuController) CreateSubmenu(ctx *gin.Context) {
	var req request.CreateSubmenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create submenu request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	submenu, err := c.submenuService.Create(ctx, req, username)
	if err != nil {
		utils.LogError("Failed to create submenu", err, map[string]interface{}{"title": req.Title})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create submenu", nil)
		return
	}
	utils.LogInfo("Submenu created successfully", map[string]interface{}{"title": req.Title})
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "Submenu created successfully", submenu)
}

func (c *SubmenuController) FindAllSubmenus(ctx *gin.Context) {
	params := utils.GetPaginationParams(ctx, 10)
	search := ctx.Query("search")
	submenus, total, err := c.submenuService.FindAllWithPagination(ctx, params, search)
	if err != nil {
		utils.LogError("Failed to fetch submenus", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to fetch submenus", nil)
		return
	}

	paginatedResponse := utils.CreatePaginationResponse(submenus, total, params)
	utils.LogInfo("Submenus fetched successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Submenus fetched successfully", paginatedResponse)
}

func (c *SubmenuController) FindSubmenuByID(ctx *gin.Context) {
	id := ctx.Param("id")
	submenu, err := c.submenuService.FindByID(ctx, id)
	if err != nil {
		utils.LogError("Failed to find submenu", err, map[string]interface{}{"submenu_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Submenu not found", nil)
		return
	}
	utils.LogInfo("Submenu found successfully", map[string]interface{}{"submenu_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Submenu found", submenu)
}

func (c *SubmenuController) UpdateSubmenu(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.CreateSubmenuRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update submenu request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.submenuService.Update(ctx, id, req, username); err != nil {
		utils.LogError("Failed to update submenu", err, map[string]interface{}{"submenu_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Failed to update submenu", nil)
		return
	}
	utils.LogInfo("Submenu updated successfully", map[string]interface{}{"submenu_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Submenu updated successfully", nil)
}

func (c *SubmenuController) DeleteSubmenu(ctx *gin.Context) {
	id := ctx.Param("id")

	claims, _ := ctx.Get("claims")
	userClaims := claims.(jwt.MapClaims)
	username := userClaims["username"].(string)

	if err := c.submenuService.Delete(ctx, id, username); err != nil {
		utils.LogError("Failed to delete submenu", err, map[string]interface{}{"submenu_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Failed to delete submenu", nil)
		return
	}

	utils.LogInfo("Submenu deleted successfully", map[string]interface{}{"submenu_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Submenu deleted successfully", nil)
}