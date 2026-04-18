package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CateringOrderItem struct {
	ItemID    primitive.ObjectID     `bson:"item_id" json:"item_id"`
	ItemName  string                 `bson:"item_name" json:"item_name"`
	ItemType  CateringOrderType      `bson:"item_type" json:"item_type"`
	Quantity  int                    `bson:"quantity" json:"quantity" validate:"min=1"`
	Price     float64                `bson:"price" json:"price" validate:"min=0"`
	Submenus  []CateringOrderSubmenu `bson:"submenus,omitempty" json:"submenus,omitempty"`
}