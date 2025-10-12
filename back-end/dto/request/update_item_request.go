package request

type UpdateItemRequest struct {
	Name        string `json:"name,omitempty"`
	SKU         string `json:"sku,omitempty"`
	Description string `json:"description,omitempty"`
	Quantity    int    `json:"quantity,omitempty"`
	CategoryID  string `json:"category_id,omitempty"`
}