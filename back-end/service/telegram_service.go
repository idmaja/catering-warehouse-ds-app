package service

type TelegramService interface {
	SendOrderNotification(order interface{}) error
	SendOrderDeleteNotification(orderNumber, orderType, status string) error
	SendUncompletedOrdersNotification() error
	SendLoginNotification(username, action, details string) error
	SendDailyActivityReport() error
}