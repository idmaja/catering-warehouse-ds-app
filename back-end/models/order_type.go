package models

type OrderType string

const (
	PurchaseOrder OrderType = "purchase"
	SalesOrder    OrderType = "sales"
)