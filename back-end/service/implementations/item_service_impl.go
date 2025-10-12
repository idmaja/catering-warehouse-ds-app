package implementations

import (
	"context"
	"time"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/dto/response"
	"warehouse-trial-gin/models"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type itemServiceImpl struct {
	itemRepo     *repository.ItemRepository
	categoryRepo repository.CategoryRepository
	auditService service.AuditService
}

func NewItemService(itemRepo *repository.ItemRepository, categoryRepo repository.CategoryRepository, auditService service.AuditService) service.ItemService {
	return &itemServiceImpl{
		itemRepo:     itemRepo,
		categoryRepo: categoryRepo,
		auditService: auditService,
	}
}

func (s *itemServiceImpl) Create(ctx context.Context, req request.CreateItemRequest, username string) (*models.Item, error) {
	item := &models.Item{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		SKU:         req.SKU,
		Description: req.Description,
		Quantity:    req.Quantity,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if req.CategoryID != "" {
		categoryObjID, err := primitive.ObjectIDFromHex(req.CategoryID)
		if err == nil {
			item.CategoryID = categoryObjID
			category, err := s.categoryRepo.GetCategoryByID(ctx, categoryObjID)
			if err == nil {
				item.CategoryName = category.Name
				item.CategoryColor = category.Color
			}
		}
	}

	if err := s.itemRepo.CreateItem(ctx, item); err != nil {
		return nil, err
	}
	go s.auditService.LogActivity(ctx, username, "CREATE", "item", "Created item: " + item.Name, "", "")
	return item, nil
}

func (s *itemServiceImpl) FindAll(ctx context.Context) ([]models.Item, error) {
	return s.itemRepo.FindAllItemsWithCategories(ctx)
}

func (s *itemServiceImpl) FindAllWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Item, int64, error) {
	return s.itemRepo.FindAllItemsWithPagination(ctx, params, search)
}

func (s *itemServiceImpl) FindByID(ctx context.Context, id string) (*models.Item, error) {
	return s.itemRepo.FindItemByID(ctx, id)
}

func (s *itemServiceImpl) Update(ctx context.Context, id string, req request.UpdateItemRequest, username string) error {
	update := make(map[string]interface{})
	if req.Name != "" {
		update["name"] = req.Name
	}
	if req.SKU != "" {
		update["sku"] = req.SKU
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.Quantity >= 0 {
		update["quantity"] = req.Quantity
	}
	if req.CategoryID != "" {
		categoryObjID, err := primitive.ObjectIDFromHex(req.CategoryID)
		if err == nil {
			update["category_id"] = categoryObjID
			category, err := s.categoryRepo.GetCategoryByID(ctx, categoryObjID)
			if err == nil {
				update["category_name"] = category.Name
				update["category_color"] = category.Color
			}
		}
	}
	update["updated_at"] = time.Now()

	err := s.itemRepo.UpdateItem(ctx, id, update)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "UPDATE", "item", "Updated item : ( " + id + " ) ( " + req.Name + " )", "", "")
	}
	return err
}

func (s *itemServiceImpl) Delete(ctx context.Context, id string, username string) error {
	err := s.itemRepo.DeleteItem(ctx, id)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "DELETE", "item", "Deleted item ID: "+id, "", "")
	}
	return err
}

func (s *itemServiceImpl) GetStats(ctx context.Context) (*response.StatsResponse, error) {
	totalItems, err := s.itemRepo.CountItems(ctx)
	if err != nil {
		return nil, err
	}

	lowStock, err := s.itemRepo.CountLowStockItems(ctx)
	if err != nil {
		return nil, err
	}

	totalCategories, err := s.categoryRepo.CountCategories(ctx)
	if err != nil {
		return nil, err
	}

	return &response.StatsResponse{
		TotalItems:      totalItems,
		LowStock:        lowStock,
		TotalCategories: totalCategories,
	}, nil
}