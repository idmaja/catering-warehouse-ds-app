package implementations

import (
	"context"
	"time"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type menuCategoryServiceImpl struct {
	menuCategoryRepo *repository.MenuCategoryRepository
	auditService     service.AuditService
}

func NewMenuCategoryService(menuCategoryRepo *repository.MenuCategoryRepository, auditService service.AuditService) service.MenuCategoryService {
	return &menuCategoryServiceImpl{
		menuCategoryRepo: menuCategoryRepo,
		auditService:     auditService,
	}
}

func (s *menuCategoryServiceImpl) CreateMenuCategory(ctx context.Context, req *request.CreateMenuCategoryRequest, username string) (*models.MenuCategory, error) {
	category := &models.MenuCategory{
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := s.menuCategoryRepo.CreateMenuCategory(ctx, category)
	if err != nil {
		return nil, err
	}

	go s.auditService.LogActivity(ctx, username, "CREATE", "menu_category", "Created menu category: "+category.Name, "", "")
	return category, nil
}

func (s *menuCategoryServiceImpl) GetAllMenuCategories(ctx context.Context) ([]models.MenuCategory, error) {
	return s.menuCategoryRepo.GetAllMenuCategories(ctx)
}

func (s *menuCategoryServiceImpl) GetAllMenuCategoriesWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.MenuCategory, int64, error) {
	return s.menuCategoryRepo.GetAllMenuCategoriesWithPagination(ctx, params)
}

func (s *menuCategoryServiceImpl) GetMenuCategoryByID(ctx context.Context, id string) (*models.MenuCategory, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	return s.menuCategoryRepo.GetMenuCategoryByID(ctx, objectID)
}

func (s *menuCategoryServiceImpl) UpdateMenuCategory(ctx context.Context, id string, req *request.CreateMenuCategoryRequest, username string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	category := &models.MenuCategory{
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
		UpdatedAt:   time.Now(),
	}

	err = s.menuCategoryRepo.UpdateMenuCategory(ctx, objectID, category)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "UPDATE", "menu_category", "Updated menu category: "+category.Name, "", "")
	}
	return err
}

func (s *menuCategoryServiceImpl) DeleteMenuCategory(ctx context.Context, id string, username string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	err = s.menuCategoryRepo.DeleteMenuCategory(ctx, objectID)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "DELETE", "menu_category", "Deleted menu category ID: "+id, "", "")
	}
	return err
}