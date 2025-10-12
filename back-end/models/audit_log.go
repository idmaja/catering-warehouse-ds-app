package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ActivityLog struct {
	Username  string    `bson:"username" json:"username"`
	Action    string    `bson:"action" json:"action"`
	Resource  string    `bson:"resource" json:"resource"`
	Details   string    `bson:"details" json:"details"`
	IPAddress string    `bson:"ip_address" json:"ip_address"`
	UserAgent string    `bson:"user_agent" json:"user_agent"`
	Timestamp time.Time `bson:"timestamp" json:"timestamp"`
}

type AuditLog struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Date       string             `bson:"date" json:"date"`
	Activities []ActivityLog      `bson:"activities" json:"activities"`
	CreatedAt  time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at" json:"updated_at"`
}