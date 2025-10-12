package service

import (
	"context"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
)

type CateringOrderService interface {
	CreateCateringOrder(ctx context.Context, req request.CreateCateringOrderRequest, username string) (*models.CateringOrder, error)
	GetAllCateringOrders(ctx context.Context) ([]models.CateringOrder, error)
	GetCateringOrdersWithFilters(ctx context.Context, page, limit, status, dateFilter, search string) ([]models.CateringOrder, int64, error)
	GetCateringOrderByID(ctx context.Context, id string) (*models.CateringOrder, error)
	UpdateCateringOrderStatus(ctx context.Context, id string, req request.UpdateCateringOrderStatusRequest, username string) error
	DeleteCateringOrder(ctx context.Context, id string, username string) error
}