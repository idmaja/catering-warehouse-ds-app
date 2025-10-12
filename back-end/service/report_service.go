package service

import (
	"context"
	"warehouse-trial-gin/dto/response"
)

type ReportService interface {
	GetDashboardReport(ctx context.Context, revenueFilter string) (*response.ReportResponse, error)
}