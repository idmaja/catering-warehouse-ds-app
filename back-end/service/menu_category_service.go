package service

import (
	"context"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
)

type MenuCategoryService interface {
	CreateMenuCategory(ctx context.Context, req *request.CreateMenuCategoryRequest, username string) (*models.MenuCategory, error)
	GetAllMenuCategories(ctx context.Context) ([]models.MenuCategory, error)
	GetAllMenuCategoriesWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.MenuCategory, int64, error)
	GetMenuCategoryByID(ctx context.Context, id string) (*models.MenuCategory, error)
	UpdateMenuCategory(ctx context.Context, id string, req *request.CreateMenuCategoryRequest, username string) error
	DeleteMenuCategory(ctx context.Context, id string, username string) error
}