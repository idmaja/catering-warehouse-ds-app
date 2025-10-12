package service

import (
	"context"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/dto/response"
	"warehouse-trial-gin/models"
)

type ItemService interface {
	FindAll(ctx context.Context) ([]models.Item, error)
	FindAllWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Item, int64, error)
	FindByID(ctx context.Context, id string) (*models.Item, error)
	Create(ctx context.Context, req request.CreateItemRequest, username string) (*models.Item, error)
	Update(ctx context.Context, id string, req request.UpdateItemRequest, username string) error
	Delete(ctx context.Context, id string, username string) error
	GetStats(ctx context.Context) (*response.StatsResponse, error)
}