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

type submenuServiceImpl struct {
	submenuRepo      *repository.SubmenuRepository
	menuCategoryRepo *repository.MenuCategoryRepository
	auditService     service.AuditService
}

func NewSubmenuService(submenuRepo *repository.SubmenuRepository, menuCategoryRepo *repository.MenuCategoryRepository, auditService service.AuditService) service.SubmenuService {
	return &submenuServiceImpl{
		submenuRepo:      submenuRepo,
		menuCategoryRepo: menuCategoryRepo,
		auditService:     auditService,
	}
}

func (s *submenuServiceImpl) Create(ctx context.Context, req request.CreateSubmenuRequest, username string) (*models.Submenu, error) {
	submenu := &models.Submenu{
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
			submenu.CategoryID = categoryObjID
			category, err := s.menuCategoryRepo.GetMenuCategoryByID(ctx, categoryObjID)
			if err == nil {
				submenu.CategoryName = category.Name
				submenu.CategoryColor = category.Color
			}
		}
	}

	// Handle linked menus
	if len(req.LinkedMenus) > 0 {
		var linkedMenus []primitive.ObjectID
		for _, menuID := range req.LinkedMenus {
			if objID, err := primitive.ObjectIDFromHex(menuID); err == nil {
				linkedMenus = append(linkedMenus, objID)
			}
		}
		submenu.LinkedMenus = linkedMenus
	}

	if err := s.submenuRepo.CreateSubmenu(ctx, submenu); err != nil {
		return nil, err
	}
	go s.auditService.LogActivity(ctx, username, "CREATE", "submenu", "Created submenu: "+submenu.Title, "", "")
	return submenu, nil
}

func (s *submenuServiceImpl) FindAll(ctx context.Context) ([]models.Submenu, error) {
	return s.submenuRepo.FindAllSubmenus(ctx)
}

func (s *submenuServiceImpl) FindAllWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Submenu, int64, error) {
	return s.submenuRepo.FindAllSubmenusWithPagination(ctx, params, search)
}

func (s *submenuServiceImpl) FindByID(ctx context.Context, id string) (*models.Submenu, error) {
	return s.submenuRepo.FindSubmenuByID(ctx, id)
}

func (s *submenuServiceImpl) Update(ctx context.Context, id string, req request.CreateSubmenuRequest, username string) error {
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

	// Handle linked menus
	if len(req.LinkedMenus) > 0 {
		var linkedMenus []primitive.ObjectID
		for _, menuID := range req.LinkedMenus {
			if objID, err := primitive.ObjectIDFromHex(menuID); err == nil {
				linkedMenus = append(linkedMenus, objID)
			}
		}
		update["linked_menus"] = linkedMenus
	}
	update["updated_at"] = time.Now()

	err := s.submenuRepo.UpdateSubmenu(ctx, id, update)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "UPDATE", "submenu", "Updated submenu: "+req.Title, "", "")
	}
	return err
}

func (s *submenuServiceImpl) Delete(ctx context.Context, id string, username string) error {
	err := s.submenuRepo.DeleteSubmenu(ctx, id)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "DELETE", "submenu", "Deleted submenu ID: "+id, "", "")
	}
	return err
}