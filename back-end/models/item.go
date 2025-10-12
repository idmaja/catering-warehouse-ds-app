package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Item struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name          string             `bson:"name" json:"name" validate:"required"`
	SKU           string             `bson:"sku" json:"sku" validate:"required"`
	Description   string             `bson:"description" json:"description"`
	Quantity      int                `bson:"quantity" json:"quantity" validate:"min=0"`
	CategoryID    primitive.ObjectID `bson:"category_id,omitempty" json:"category_id,omitempty"`
	CategoryName  string             `bson:"category_name,omitempty" json:"category_name,omitempty"`
	CategoryColor string             `bson:"category_color,omitempty" json:"category_color,omitempty"`
	CreatedAt     time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time          `bson:"updated_at" json:"updated_at"`
}