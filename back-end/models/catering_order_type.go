package models

type CateringOrderType string

const (
	CateringOrderTypeMenu    CateringOrderType = "menu"
	CateringOrderTypeSubmenu CateringOrderType = "submenu"
)