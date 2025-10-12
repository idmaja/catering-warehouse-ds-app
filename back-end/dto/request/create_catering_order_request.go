package request

import "time"

type CreateCateringOrderSubmenuRequest struct {
	ItemID   string `json:"item_id" binding:"required"`
	ItemType string `json:"item_type" binding:"required,oneof=submenu"`
	Quantity int    `json:"quantity" binding:"required,min=1"`
	Price    float64 `json:"price" binding:"required,min=0"`
}

type CreateCateringOrderItemRequest struct {
	ItemID   string                              `json:"item_id" binding:"required"`
	ItemType string                              `json:"item_type" binding:"required,oneof=menu"`
	Quantity int                                 `json:"quantity" binding:"required,min=1"`
	Price    float64                             `json:"price" binding:"required,min=0"`
	Submenus []CreateCateringOrderSubmenuRequest `json:"submenus,omitempty"`
}

type CreateCateringOrderRequest struct {
	CustomerName  string                            `json:"customer_name" binding:"required"`
	CustomerPhone string                            `json:"customer_phone"`
	DeliveryDate  time.Time                         `json:"delivery_date" binding:"required"`
	PaymentVia    string                            `json:"payment_via" binding:"required"`
	Items         []CreateCateringOrderItemRequest  `json:"items" binding:"required,min=1"`
}