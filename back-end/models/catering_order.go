package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CateringOrder struct {
	ID           primitive.ObjectID    `bson:"_id,omitempty" json:"id,omitempty"`
	OrderNumber  string                `bson:"order_number" json:"order_number"`
	CustomerName string                `bson:"customer_name" json:"customer_name" validate:"required"`
	CustomerPhone string               `bson:"customer_phone" json:"customer_phone"`
	DeliveryDate time.Time             `bson:"delivery_date" json:"delivery_date"`
	PaymentVia   string                `bson:"payment_via" json:"payment_via"`
	Status       CateringOrderStatus   `bson:"status" json:"status"`
	Items        []CateringOrderItem   `bson:"items" json:"items" validate:"required,min=1"`
	TotalAmount  float64               `bson:"total_amount" json:"total_amount"`
	CreatedBy    primitive.ObjectID    `bson:"created_by" json:"created_by"`
	CreatedAt    time.Time             `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time             `bson:"updated_at" json:"updated_at"`
}

