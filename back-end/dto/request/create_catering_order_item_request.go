package request

type CreateCateringOrderItemRequest struct {
	ItemID   string                              `json:"item_id" binding:"required"`
	ItemType string                              `json:"item_type" binding:"required,oneof=menu"`
	Quantity int                                 `json:"quantity" binding:"required,min=1"`
	Price    float64                             `json:"price" binding:"required,min=0"`
	Submenus []CreateCateringOrderSubmenuRequest `json:"submenus,omitempty"`
}