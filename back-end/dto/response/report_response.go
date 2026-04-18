package response

type ReportResponse struct {
	TotalItems       int64                    `json:"totalItems"`
	TotalOrders      int64                    `json:"totalOrders"`
	TotalRevenue     float64                  `json:"totalRevenue"`
	LowStockItems    int64                    `json:"lowStockItems"`
	TopItems         []TopItemResponse        `json:"topItems"`
	OrdersByStatus   []OrderStatusResponse    `json:"ordersByStatus"`
	RevenueData      []RevenueDataResponse    `json:"revenueData"`
	CategoryStats    []CategoryStatsResponse  `json:"categoryStats"`
}