package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Submenu struct {
	ID               primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	Title            string               `bson:"title" json:"title" validate:"required"`
	Description      string               `bson:"description" json:"description"`
	CategoryID       primitive.ObjectID   `bson:"category_id,omitempty" json:"category_id,omitempty"`
	CategoryName     string               `bson:"category_name,omitempty" json:"category_name,omitempty"`
	CategoryColor    string               `bson:"category_color,omitempty" json:"category_color,omitempty"`
	LinkedMenus      []primitive.ObjectID `bson:"linked_menus,omitempty" json:"linked_menus,omitempty"`
	SellPrice        float64              `bson:"sell_price" json:"sell_price" validate:"min=0"`
	Status           string               `bson:"status" json:"status" validate:"oneof=active inactive"`
	CreatedAt        time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt        time.Time            `bson:"updated_at" json:"updated_at"`
}