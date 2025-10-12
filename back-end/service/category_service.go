package service

import (
	"context"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
)

type CategoryService interface {
	CreateCategory(ctx context.Context, req *request.CreateCategoryRequest, username string) (*models.Category, error)
	GetAllCategories(ctx context.Context) ([]models.Category, error)
	GetAllCategoriesWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.Category, int64, error)
	GetCategoryByID(ctx context.Context, id string) (*models.Category, error)
	UpdateCategory(ctx context.Context, id string, req *request.CreateCategoryRequest, username string) error
	DeleteCategory(ctx context.Context, id string, username string) error
}