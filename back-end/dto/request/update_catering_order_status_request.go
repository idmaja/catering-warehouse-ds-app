package request

type UpdateCateringOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending confirmed preparing ready delivered completed cancelled"`
}