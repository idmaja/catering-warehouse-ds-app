package request

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=draft approved completed"`
}