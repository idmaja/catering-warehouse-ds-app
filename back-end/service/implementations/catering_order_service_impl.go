package implementations

import (
	"context"
	"fmt"
	"time"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type cateringOrderServiceImpl struct {
	cateringOrderRepo *repository.CateringOrderRepository
	menuRepo          *repository.MenuRepository
	submenuRepo       *repository.SubmenuRepository
	userRepo          *repository.UserRepository
	auditService      service.AuditService
}

func NewCateringOrderService(cateringOrderRepo *repository.CateringOrderRepository, menuRepo *repository.MenuRepository, submenuRepo *repository.SubmenuRepository, userRepo *repository.UserRepository, auditService service.AuditService) service.CateringOrderService {
	return &cateringOrderServiceImpl{
		cateringOrderRepo: cateringOrderRepo,
		menuRepo:          menuRepo,
		submenuRepo:       submenuRepo,
		userRepo:          userRepo,
		auditService:      auditService,
	}
}

func (s *cateringOrderServiceImpl) CreateCateringOrder(ctx context.Context, req request.CreateCateringOrderRequest, username string) (*models.CateringOrder, error) {
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	userObjID := user.ID

	var orderItems []models.CateringOrderItem
	var totalAmount float64

	for _, item := range req.Items {
		itemObjID, err := primitive.ObjectIDFromHex(item.ItemID)
		if err != nil {
			return nil, err
		}

		var itemName string
		menuData, err := s.menuRepo.FindMenuByID(ctx, item.ItemID)
		if err != nil {
			return nil, err
		}
		itemName = menuData.Title

		// Process submenus
		var orderSubmenus []models.CateringOrderSubmenu
		for _, submenu := range item.Submenus {
			submenuObjID, err := primitive.ObjectIDFromHex(submenu.ItemID)
			if err != nil {
				return nil, err
			}

			submenuData, err := s.submenuRepo.FindSubmenuByID(ctx, submenu.ItemID)
			if err != nil {
				return nil, err
			}

			orderSubmenu := models.CateringOrderSubmenu{
				ItemID:   submenuObjID,
				ItemName: submenuData.Title,
				Quantity: submenu.Quantity,
				Price:    submenu.Price,
			}
			orderSubmenus = append(orderSubmenus, orderSubmenu)
			totalAmount += submenu.Price * float64(submenu.Quantity)
		}

		orderItem := models.CateringOrderItem{
			ItemID:   itemObjID,
			ItemName: itemName,
			ItemType: models.CateringOrderType(item.ItemType),
			Quantity: item.Quantity,
			Price:    item.Price,
			Submenus: orderSubmenus,
		}
		orderItems = append(orderItems, orderItem)
		totalAmount += item.Price * float64(item.Quantity)
	}

	dateStr := time.Now().Format("20060102")
	randomStr := fmt.Sprintf("%04d", time.Now().UnixNano()%10000)
	orderNumber := fmt.Sprintf("CAT-%s-%s", dateStr, randomStr)

	order := &models.CateringOrder{
		OrderNumber:   orderNumber,
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
		DeliveryDate:  req.DeliveryDate,
		PaymentVia:    req.PaymentVia,
		Status:        models.CateringStatusPending,
		Items:         orderItems,
		TotalAmount:   totalAmount,
		CreatedBy:     userObjID,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := s.cateringOrderRepo.CreateCateringOrder(ctx, order); err != nil {
		return nil, err
	}

	go s.auditService.LogActivity(ctx, username, "CREATE", "catering_order", "Created catering order: "+order.OrderNumber, "", "")
	return order, nil
}

func (s *cateringOrderServiceImpl) GetAllCateringOrders(ctx context.Context) ([]models.CateringOrder, error) {
	return s.cateringOrderRepo.FindAllCateringOrders(ctx)
}

func (s *cateringOrderServiceImpl) GetCateringOrdersWithFilters(ctx context.Context, page, limit, status, dateFilter, search string) ([]models.CateringOrder, int64, error) {
	return s.cateringOrderRepo.FindCateringOrdersWithFilters(ctx, page, limit, status, dateFilter, search)
}

func (s *cateringOrderServiceImpl) GetCateringOrderByID(ctx context.Context, id string) (*models.CateringOrder, error) {
	return s.cateringOrderRepo.FindCateringOrderByID(ctx, id)
}

func (s *cateringOrderServiceImpl) UpdateCateringOrderStatus(ctx context.Context, id string, req request.UpdateCateringOrderStatusRequest, username string) error {
	if err := s.cateringOrderRepo.UpdateCateringOrderStatus(ctx, id, models.CateringOrderStatus(req.Status)); err != nil {
		return err
	}

	go s.auditService.LogActivity(ctx, username, "UPDATE", "catering_order", "Updated catering order status ID: "+id+" to "+req.Status, "", "")
	return nil
}

func (s *cateringOrderServiceImpl) DeleteCateringOrder(ctx context.Context, id string, username string) error {
	err := s.cateringOrderRepo.DeleteCateringOrder(ctx, id)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "DELETE", "catering_order", "Deleted catering order ID: "+id, "", "")
	}
	return err
}