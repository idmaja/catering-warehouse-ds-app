package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Order struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	OrderNumber string             `bson:"order_number" json:"order_number"`
	Type        OrderType          `bson:"type" json:"type" validate:"oneof=purchase sales"`
	Status      OrderStatus        `bson:"status" json:"status" validate:"oneof=draft approved completed"`
	Items       []OrderItem        `bson:"items" json:"items" validate:"required,min=1"`
	TotalAmount float64            `bson:"total_amount" json:"total_amount"`
	CreatedBy   primitive.ObjectID `bson:"created_by" json:"created_by"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}