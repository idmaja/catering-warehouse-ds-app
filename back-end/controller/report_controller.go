package controller

import (
	"net/http"
	"warehouse-trial-gin/dto/response"
	"warehouse-trial-gin/service"
	"warehouse-trial-gin/utils"

	"github.com/gin-gonic/gin"
)

type ReportController struct {
	reportService service.ReportService
}

func NewReportController(reportService service.ReportService) *ReportController {
	return &ReportController{reportService: reportService}
}

func (c *ReportController) GetDashboardReport(ctx *gin.Context) {
	revenueFilter := ctx.DefaultQuery("revenue_filter", "monthly")
	
	report, err := c.reportService.GetDashboardReport(ctx, revenueFilter)
	if err != nil {
		utils.LogError("Failed to get dashboard report", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to get report", nil)
		return
	}
	
	utils.LogInfo("Dashboard report retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Report retrieved successfully", report)
}