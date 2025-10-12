package implementations

import (
	"context"
	// "time"
	"warehouse-trial-gin/dto/response"
	"warehouse-trial-gin/models"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service"

	// "go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type reportServiceImpl struct {
	itemRepo     *repository.ItemRepository
	orderRepo    *repository.OrderRepository
	categoryRepo repository.CategoryRepository
	db           *mongo.Client
}

func NewReportService(itemRepo *repository.ItemRepository, orderRepo *repository.OrderRepository, categoryRepo repository.CategoryRepository, db *mongo.Client) service.ReportService {
	return &reportServiceImpl{
		itemRepo:     itemRepo,
		orderRepo:    orderRepo,
		categoryRepo: categoryRepo,
		db:           db,
	}
}

func (s *reportServiceImpl) GetDashboardReport(ctx context.Context, revenueFilter string) (*response.ReportResponse, error) {
	// Get basic stats
	totalItems, _ := s.itemRepo.CountItems(ctx)
	lowStockItems, _ := s.itemRepo.CountLowStockItems(ctx)
	
	// Get orders and calculate stats
	orders, _ := s.orderRepo.FindAllOrders(ctx)
	totalOrders := int64(len(orders))
	
	var totalRevenue float64
	ordersByStatus := make(map[string]int64)
	revenueData := make(map[string]float64)
	
	for _, order := range orders {
		if order.Status == "completed" && order.Type == "purchase" {
			totalRevenue += order.TotalAmount
		}
		ordersByStatus[string(order.Status)]++
		
		if order.Status == "completed" && order.Type == "purchase" {
			var period string
			switch revenueFilter {
			case "daily":
				period = order.CreatedAt.Format("2006-01-02")
			case "yearly":
				period = order.CreatedAt.Format("2006")
			default: // monthly
				period = order.CreatedAt.Format("2006-01")
			}
			revenueData[period] += order.TotalAmount
		}
	}
	
	// Convert maps to slices
	var orderStatusList []response.OrderStatusResponse
	for status, count := range ordersByStatus {
		orderStatusList = append(orderStatusList, response.OrderStatusResponse{
			Status: status,
			Count:  count,
		})
	}
	
	var revenueList []response.RevenueDataResponse
	for period, revenue := range revenueData {
		revenueList = append(revenueList, response.RevenueDataResponse{
			Period:  period,
			Revenue: revenue,
		})
	}
	
	// Get top items from purchase orders only
	itemRevenue := make(map[string]float64)
	itemQuantity := make(map[string]int)
	for _, order := range orders {
		if order.Status == "completed" && order.Type == "purchase" {
			for _, item := range order.Items {
				itemRevenue[item.ItemName] += item.Price * float64(item.Quantity)
				itemQuantity[item.ItemName] += item.Quantity
			}
		}
	}
	
	var topItems []response.TopItemResponse
	for itemName, revenue := range itemRevenue {
		topItems = append(topItems, response.TopItemResponse{
			ItemName: itemName,
			Quantity: itemQuantity[itemName],
			Revenue:  revenue,
		})
	}
	
	// Get category stats based on purchase prices
	categories, _ := s.categoryRepo.GetAllCategories(ctx)
	var categoryStats []response.CategoryStatsResponse
	for _, category := range categories {
		items, _ := s.itemRepo.FindAllItems(ctx)
		itemCount := int64(0)
		totalValue := float64(0)
		
		// Calculate total value based on purchase order prices
		for _, item := range items {
			if item.CategoryID == category.ID {
				itemCount++
				// Find average purchase price for this item
				avgPrice := s.getAveragePurchasePrice(orders, item.Name)
				totalValue += float64(item.Quantity) * avgPrice
			}
		}
		categoryStats = append(categoryStats, response.CategoryStatsResponse{
			CategoryName: category.Name,
			ItemCount:    itemCount,
			TotalValue:   totalValue,
		})
	}
	
	return &response.ReportResponse{
		TotalItems:     totalItems,
		TotalOrders:    totalOrders,
		TotalRevenue:   totalRevenue,
		LowStockItems:  lowStockItems,
		TopItems:       topItems,
		OrdersByStatus: orderStatusList,
		RevenueData:    revenueList,
		CategoryStats:  categoryStats,
	}, nil
}

func (s *reportServiceImpl) getAveragePurchasePrice(orders []models.Order, itemName string) float64 {
	var totalPrice float64
	var count int
	
	for _, order := range orders {
		if order.Type == "purchase" && order.Status == "completed" {
			for _, item := range order.Items {
				if item.ItemName == itemName {
					totalPrice += item.Price
					count++
				}
			}
		}
	}
	
	if count == 0 {
		return 1000 // Default fallback price
	}
	return totalPrice / float64(count)
}