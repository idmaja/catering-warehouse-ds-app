package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Transaction struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	ItemID    primitive.ObjectID `bson:"item_id" json:"item_id"`
	Type      string             `bson:"type" json:"type" validate:"oneof=in out"` // 'in' for stock in, 'out' for stock out
	Quantity  int                `bson:"quantity" json:"quantity" validate:"min=1"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}