package response

type CategoryStatsResponse struct {
	CategoryName string  `json:"categoryName"`
	ItemCount    int64   `json:"itemCount"`
	TotalValue   float64 `json:"totalValue"`
}