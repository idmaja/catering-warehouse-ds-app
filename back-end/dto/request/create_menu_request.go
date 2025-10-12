package request

type CreateMenuRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	CategoryID  string  `json:"category_id,omitempty"`
	SellPrice   float64 `json:"sell_price" binding:"required,min=0"`
	Status      string  `json:"status" binding:"required,oneof=active inactive"`
}