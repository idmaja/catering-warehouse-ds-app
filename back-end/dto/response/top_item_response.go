package response

type TopItemResponse struct {
	ItemName string  `json:"itemName"`
	Quantity int     `json:"quantity"`
	Revenue  float64 `json:"revenue"`
}