package controller

import (
	"net/http"
	"warehouse-trial-gin/dto/response"
	"warehouse-trial-gin/service"
	"warehouse-trial-gin/utils"

	"github.com/gin-gonic/gin"
)

type AuditController struct {
	auditService service.AuditService
}

func NewAuditController(auditService service.AuditService) *AuditController {
	return &AuditController{auditService: auditService}
}

func (c *AuditController) FindAllLogs(ctx *gin.Context) {
	logs, err := c.auditService.GetAllLogs(ctx)
	if err != nil {
		utils.LogError("Failed to retrieve audit logs", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to retrieve audit logs", nil)
		return
	}

	utils.LogInfo("Audit logs retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Audit logs retrieved successfully", logs)
}

func (c *AuditController) FindLogByID(ctx *gin.Context) {
	id := ctx.Param("id")
	log, err := c.auditService.GetLogByID(ctx, id)
	if err != nil {
		utils.LogError("Failed to find audit log", err, map[string]interface{}{"log_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "Audit log not found", nil)
		return
	}

	utils.LogInfo("Audit log found successfully", map[string]interface{}{"log_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Audit log found", log)
}