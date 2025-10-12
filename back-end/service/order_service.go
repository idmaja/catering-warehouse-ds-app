package service

import (
	"context"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
)

type OrderService interface {
	CreateOrder(ctx context.Context, req request.CreateOrderRequest, username string) (*models.Order, error)
	GetAllOrders(ctx context.Context) ([]models.Order, error)
	GetOrdersWithFilters(ctx context.Context, page, limit, status, orderType, dateFilter, search string) ([]models.Order, int64, error)
	GetOrderByID(ctx context.Context, id string) (*models.Order, error)
	UpdateOrderStatus(ctx context.Context, id string, req request.UpdateOrderStatusRequest, username string) error
	DeleteOrder(ctx context.Context, id string, username string) error
}