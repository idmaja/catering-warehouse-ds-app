package service

import (
	"context"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
)

type MenuService interface {
	FindAll(ctx context.Context) ([]models.Menu, error)
	FindAllWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Menu, int64, error)
	FindByID(ctx context.Context, id string) (*models.Menu, error)
	Create(ctx context.Context, req request.CreateMenuRequest, username string) (*models.Menu, error)
	Update(ctx context.Context, id string, req request.CreateMenuRequest, username string) error
	Delete(ctx context.Context, id string, username string) error
}