package request

import "time"

type CreateCateringOrderRequest struct {
	CustomerName  string                            `json:"customer_name" binding:"required"`
	CustomerPhone string                            `json:"customer_phone"`
	DeliveryDate  time.Time                         `json:"delivery_date" binding:"required"`
	PaymentVia    string                            `json:"payment_via" binding:"required"`
	Items         []CreateCateringOrderItemRequest  `json:"items" binding:"required,min=1"`
}