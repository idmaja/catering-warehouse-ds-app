package request

type CreateItemRequest struct {
	Name        string `json:"name" binding:"required"`
	SKU         string `json:"sku" binding:"required"`
	Description string `json:"description"`
	Quantity    int    `json:"quantity" binding:"required,min=0"`
	CategoryID  string `json:"category_id,omitempty"`
}