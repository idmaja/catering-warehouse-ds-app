package service

import (
	"context"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
)

type SubmenuService interface {
	FindAll(ctx context.Context) ([]models.Submenu, error)
	FindAllWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Submenu, int64, error)
	FindByID(ctx context.Context, id string) (*models.Submenu, error)
	Create(ctx context.Context, req request.CreateSubmenuRequest, username string) (*models.Submenu, error)
	Update(ctx context.Context, id string, req request.CreateSubmenuRequest, username string) error
	Delete(ctx context.Context, id string, username string) error
}