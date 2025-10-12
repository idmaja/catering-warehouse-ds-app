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

type TopItemResponse struct {
	ItemName string `json:"itemName"`
	Quantity int    `json:"quantity"`
	Revenue  float64 `json:"revenue"`
}

type OrderStatusResponse struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type RevenueDataResponse struct {
	Period  string  `json:"period"`
	Revenue float64 `json:"revenue"`
}

type CategoryStatsResponse struct {
	CategoryName string `json:"categoryName"`
	ItemCount    int64  `json:"itemCount"`
	TotalValue   float64 `json:"totalValue"`
}