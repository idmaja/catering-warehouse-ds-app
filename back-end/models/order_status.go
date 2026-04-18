package models

type OrderStatus string

const (
	StatusDraft     OrderStatus = "draft"
	StatusApproved  OrderStatus = "approved"
	StatusCompleted OrderStatus = "completed"
)