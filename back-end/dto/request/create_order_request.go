package request

type CreateOrderRequest struct {
	Type  string                    `json:"type" binding:"required,oneof=purchase sales"`
	Items []CreateOrderItemRequest `json:"items" binding:"required,min=1"`
}