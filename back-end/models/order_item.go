package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderItem struct {
	ItemID   primitive.ObjectID `bson:"item_id" json:"item_id"`
	ItemName string             `bson:"item_name" json:"item_name"`
	Quantity int                `bson:"quantity" json:"quantity" validate:"min=1"`
	Price    float64            `bson:"price" json:"price" validate:"min=0"`
}