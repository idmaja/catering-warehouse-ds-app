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

type menuServiceImpl struct {
	menuRepo         *repository.MenuRepository
	menuCategoryRepo *repository.MenuCategoryRepository
	auditService     service.AuditService
}

func NewMenuService(menuRepo *repository.MenuRepository, menuCategoryRepo *repository.MenuCategoryRepository, auditService service.AuditService) service.MenuService {
	return &menuServiceImpl{
		menuRepo:         menuRepo,
		menuCategoryRepo: menuCategoryRepo,
		auditService:     auditService,
	}
}

func (s *menuServiceImpl) Create(ctx context.Context, req request.CreateMenuRequest, username string) (*models.Menu, error) {
	menu := &models.Menu{
		ID:          primitive.NewObjectID(),
		Title:       req.Title,
		Description: req.Description,
		SellPrice:   req.SellPrice,
		Status:      req.Status,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if req.CategoryID != "" {
		categoryObjID, err := primitive.ObjectIDFromHex(req.CategoryID)
		if err == nil {
			menu.CategoryID = categoryObjID
			category, err := s.menuCategoryRepo.GetMenuCategoryByID(ctx, categoryObjID)
			if err == nil {
				menu.CategoryName = category.Name
				menu.CategoryColor = category.Color
			}
		}
	}

	if err := s.menuRepo.CreateMenu(ctx, menu); err != nil {
		return nil, err
	}
	go s.auditService.LogActivity(ctx, username, "CREATE", "menu", "Created menu: "+menu.Title, "", "")
	return menu, nil
}

func (s *menuServiceImpl) FindAll(ctx context.Context) ([]models.Menu, error) {
	return s.menuRepo.FindAllMenus(ctx)
}

func (s *menuServiceImpl) FindAllWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Menu, int64, error) {
	return s.menuRepo.FindAllMenusWithPagination(ctx, params, search)
}

func (s *menuServiceImpl) FindByID(ctx context.Context, id string) (*models.Menu, error) {
	return s.menuRepo.FindMenuByID(ctx, id)
}

func (s *menuServiceImpl) Update(ctx context.Context, id string, req request.CreateMenuRequest, username string) error {
	update := make(map[string]interface{})
	if req.Title != "" {
		update["title"] = req.Title
	}
	if req.Description != "" {
		update["description"] = req.Description
	}
	if req.SellPrice >= 0 {
		update["sell_price"] = req.SellPrice
	}
	if req.Status != "" {
		update["status"] = req.Status
	}
	if req.CategoryID != "" {
		categoryObjID, err := primitive.ObjectIDFromHex(req.CategoryID)
		if err == nil {
			update["category_id"] = categoryObjID
			category, err := s.menuCategoryRepo.GetMenuCategoryByID(ctx, categoryObjID)
			if err == nil {
				update["category_name"] = category.Name
				update["category_color"] = category.Color
			}
		}
	}
	update["updated_at"] = time.Now()

	err := s.menuRepo.UpdateMenu(ctx, id, update)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "UPDATE", "menu", "Updated menu: "+req.Title, "", "")
	}
	return err
}

func (s *menuServiceImpl) Delete(ctx context.Context, id string, username string) error {
	err := s.menuRepo.DeleteMenu(ctx, id)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "DELETE", "menu", "Deleted menu ID: "+id, "", "")
	}
	return err
}