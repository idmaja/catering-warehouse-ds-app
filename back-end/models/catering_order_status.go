package models

type CateringOrderStatus string

const (
	CateringStatusPending   CateringOrderStatus = "pending"
	CateringStatusConfirmed CateringOrderStatus = "confirmed"
	CateringStatusPreparing CateringOrderStatus = "preparing"
	CateringStatusReady     CateringOrderStatus = "ready"
	CateringStatusDelivered CateringOrderStatus = "delivered"
	CateringStatusCompleted CateringOrderStatus = "completed"
	CateringStatusCancelled CateringOrderStatus = "cancelled"
)