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

type orderServiceImpl struct {
	orderRepo    *repository.OrderRepository
	itemRepo     *repository.ItemRepository
	userRepo     *repository.UserRepository
	auditService service.AuditService
}

func NewOrderService(orderRepo *repository.OrderRepository, itemRepo *repository.ItemRepository, userRepo *repository.UserRepository, auditService service.AuditService) service.OrderService {
	return &orderServiceImpl{
		orderRepo:    orderRepo,
		itemRepo:     itemRepo,
		userRepo:     userRepo,
		auditService: auditService,
	}
}

func (s *orderServiceImpl) CreateOrder(ctx context.Context, req request.CreateOrderRequest, username string) (*models.Order, error) {
	// Find user by username to get ObjectID
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	userObjID := user.ID

	var orderItems []models.OrderItem
	var totalAmount float64

	for _, item := range req.Items {
		itemObjID, err := primitive.ObjectIDFromHex(item.ItemID)
		if err != nil {
			return nil, err
		}

		itemData, err := s.itemRepo.FindItemByID(ctx, item.ItemID)
		if err != nil {
			return nil, err
		}

		orderItem := models.OrderItem{
			ItemID:   itemObjID,
			ItemName: itemData.Name,
			Quantity: item.Quantity,
			Price:    item.Price,
		}
		orderItems = append(orderItems, orderItem)
		totalAmount += item.Price * float64(item.Quantity)
	}

	typePrefix := "P"
	if req.Type == "sales" {
		typePrefix = "S"
	}
	dateStr := time.Now().Format("20060102")
	randomStr := fmt.Sprintf("%04d", time.Now().UnixNano()%10000)
	orderNumber := fmt.Sprintf("TR-%s-%s-%s", typePrefix, dateStr, randomStr)

	order := &models.Order{
		OrderNumber: orderNumber,
		Type:        models.OrderType(req.Type),
		Status:      models.StatusDraft,
		Items:       orderItems,
		TotalAmount: totalAmount,
		CreatedBy:   userObjID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := s.orderRepo.CreateOrder(ctx, order); err != nil {
		return nil, err
	}

	go s.auditService.LogActivity(ctx, username, "CREATE", "order", "Created order: "+order.OrderNumber, "", "")
	return order, nil
}

func (s *orderServiceImpl) GetAllOrders(ctx context.Context) ([]models.Order, error) {
	return s.orderRepo.FindAllOrders(ctx)
}

func (s *orderServiceImpl) GetOrdersWithFilters(ctx context.Context, page, limit, status, orderType, dateFilter, search string) ([]models.Order, int64, error) {
	return s.orderRepo.FindOrdersWithFilters(ctx, page, limit, status, orderType, dateFilter, search)
}

func (s *orderServiceImpl) GetOrderByID(ctx context.Context, id string) (*models.Order, error) {
	return s.orderRepo.FindOrderByID(ctx, id)
}

func (s *orderServiceImpl) UpdateOrderStatus(ctx context.Context, id string, req request.UpdateOrderStatusRequest, username string) error {
	// Get the order first to access its items
	order, err := s.orderRepo.FindOrderByID(ctx, id)
	if err != nil {
		return err
	}

	// Update order status
	if err := s.orderRepo.UpdateOrderStatus(ctx, id, models.OrderStatus(req.Status)); err != nil {
		return err
	}

	go s.auditService.LogActivity(ctx, username, "UPDATE", "order", "Updated order status ID: "+id+" to "+req.Status, "", "")

	// Update item quantities when status changes to completed
	if req.Status == "completed" && order.Status != "completed" {
		for _, orderItem := range order.Items {
			switch order.Type {
			case "purchase":
				// Purchase order increases stock
				if err := s.itemRepo.UpdateItem(ctx, orderItem.ItemID.Hex(), map[string]interface{}{
					"$inc": map[string]interface{}{"quantity": orderItem.Quantity},
				}); err != nil {
					return err
				}
			case "sales":
				// Sales order decreases stock
				if err := s.itemRepo.UpdateItem(ctx, orderItem.ItemID.Hex(), map[string]interface{}{
					"$inc": map[string]interface{}{"quantity": -orderItem.Quantity},
				}); err != nil {
					return err
				}
			}
		}
	}

	return nil
}

func (s *orderServiceImpl) DeleteOrder(ctx context.Context, id string, username string) error {
	err := s.orderRepo.DeleteOrder(ctx, id)
	if err == nil {
		go s.auditService.LogActivity(ctx, username, "DELETE", "order", "Deleted order ID: "+id, "", "")
	}
	return err
}