package models

import (
	"time"
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