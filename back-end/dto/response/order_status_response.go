package response

type OrderStatusResponse struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}