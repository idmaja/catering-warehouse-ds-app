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

type categoryServiceImpl struct {
	categoryRepo repository.CategoryRepository
	auditService service.AuditService
}

func NewCategoryService(categoryRepo repository.CategoryRepository, auditService service.AuditService) *categoryServiceImpl {
	return &categoryServiceImpl{
		categoryRepo: categoryRepo,
		auditService: auditService,
	}
}

func (s *categoryServiceImpl) CreateCategory(ctx context.Context, req *request.CreateCategoryRequest, username string) (*models.Category, error) {
	category := &models.Category{
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := s.categoryRepo.CreateCategory(ctx, category)
	if err != nil {
		return nil, err
	}

	go s.auditService.LogActivity(ctx, username, "CREATE", "category", "Created category: "+category.Name, "", "")
	return category, nil
}

func (s *categoryServiceImpl) GetAllCategories(ctx context.Context) ([]models.Category, error) {
	return s.categoryRepo.GetAllCategories(ctx)
}

func (s *categoryServiceImpl) GetAllCategoriesWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.Category, int64, error) {
	return s.categoryRepo.GetAllCategoriesWithPagination(ctx, params)
}

func (s *categoryServiceImpl) GetCategoryByID(ctx context.Context, id string) (*models.Category, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	return s.categoryRepo.GetCategoryByID(ctx, objectID)
}

func (s *categoryServiceImpl) UpdateCategory(ctx context.Context, id string, req *request.CreateCategoryRequest, username string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	category := &models.Category{
		Name:        req.Name,
		Description: req.Description,
		Color:       req.Color,
		UpdatedAt:   time.Now(),
	}

	err = s.categoryRepo.UpdateCategory(ctx, objectID, category)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "UPDATE", "category", "Updated category: "+category.Name, "", "")
	}
	return err
}

func (s *categoryServiceImpl) DeleteCategory(ctx context.Context, id string, username string) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	err = s.categoryRepo.DeleteCategory(ctx, objectID)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "DELETE", "category", "Deleted category ID: "+id, "", "")
	}
	return err
}