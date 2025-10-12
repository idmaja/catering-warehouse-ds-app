package implementations

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	// "io"
	"net/http"
	"strconv"
	"strings"
	"time"
	"warehouse-trial-gin/config"
	"warehouse-trial-gin/models"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service"
)

type telegramServiceImpl struct {
	cfg          config.Config
	auditService service.AuditService
	orderRepo    *repository.OrderRepository
}

func NewTelegramService(cfg config.Config, auditService service.AuditService, orderRepo *repository.OrderRepository) service.TelegramService {
	return &telegramServiceImpl{
		cfg:          cfg,
		auditService: auditService,
		orderRepo:    orderRepo,
	}
}

func (s *telegramServiceImpl) SendOrderNotification(order interface{}) error {
	orderData := order.(map[string]interface{})
	
	message := "🛒 <b>Order Alert</b>\n\n"
	message += fmt.Sprintf("Order Number: %v\n", orderData["order_number"])
	message += fmt.Sprintf("Type: %v\n", orderData["type"])
	message += fmt.Sprintf("Status: %v\n", orderData["status"])
	message += fmt.Sprintf("Total Amount: %s\n", s.formatRupiah(orderData["total_amount"].(float64)))
	message += fmt.Sprintf("Created By: %v\n", orderData["created_by"])
	
	if items, ok := orderData["items"]; ok {
		message += "\n<b>Items:</b>\n"
		if itemSlice, ok := items.([]models.OrderItem); ok {
			for i, item := range itemSlice {
				message += fmt.Sprintf("%d. %s (Qty: %d, Price: %s)\n", 
					i+1, item.ItemName, item.Quantity, s.formatRupiah(item.Price))
			}
		}
	}
	
	message += fmt.Sprintf("\nTime: %s", time.Now().Format("2006-01-02 15:04:05"))
	return s.sendMessage(message)
}

func (s *telegramServiceImpl) SendOrderDeleteNotification(orderNumber, orderType, status string) error {
	message := fmt.Sprintf("🗑️ <b>Order Deleted</b>\n\nOrder: %s\nType: %s\nStatus: %s\nTime: %s", 
		orderNumber, orderType, status, time.Now().Format("2006-01-02 15:04:05"))
	err := s.sendMessage(message)
	return err
}

func (s *telegramServiceImpl) SendLoginNotification(username, action, details string) error {
	emoji := "🔐"
	if action == "LOGIN_FAILED" {
		emoji = "⚠️"
	}
	message := fmt.Sprintf("%s <b>Login Alert</b>\n\nUser: %s\nAction: %s\nDetails: %s\nTime: %s", 
		emoji, username, action, details, time.Now().Format("2006-01-02 15:04:05"))
	err := s.sendMessage(message)
	return err
}

func (s *telegramServiceImpl) SendDailyActivityReport() error {
	ctx := context.Background()
	logs, err := s.auditService.GetAllLogs(ctx)
	if err != nil {
		return err
	}

	today := time.Now().Format("2006-01-02")
	var todayActivities int
	
	for _, log := range logs {
		if log.Date == today {
			todayActivities = len(log.Activities)
			break
		}
	}

	message := fmt.Sprintf("📊 <b>Daily Activity Report</b>\n\nDate: %s\nTotal Activities: %d\n\nGenerated at: %s", 
		today, todayActivities, time.Now().Format("15:04:05"))
	return s.sendMessage(message)
}

func (s *telegramServiceImpl) SendUncompletedOrdersNotification() error {
	ctx := context.Background()
	orders, err := s.orderRepo.FindAllOrders(ctx)
	if err != nil {
		return err
	}

	var uncompletedOrders []models.Order
	yesterday := time.Now().AddDate(0, 0, -1)
	
	for _, order := range orders {
		if order.Status != "completed" && order.CreatedAt.Before(yesterday) {
			uncompletedOrders = append(uncompletedOrders, order)
		}
	}

	if len(uncompletedOrders) == 0 {
		return nil
	}

	message := fmt.Sprintf("⚠️ <b>Uncompleted Orders Alert</b>\n\nFound %d orders not completed within 24 hours:\n\n", len(uncompletedOrders))
	
	for i, order := range uncompletedOrders {
		if i >= 10 {
			message += fmt.Sprintf("...and %d more orders\n", len(uncompletedOrders)-10)
			break
		}
		message += fmt.Sprintf("%d. %s (%s) - %s\n", i+1, order.OrderNumber, string(order.Type), string(order.Status))
	}
	
	message += fmt.Sprintf("\nGenerated at: %s", time.Now().Format("2006-01-02 15:04:05"))
	return s.sendMessage(message)
}

func (s *telegramServiceImpl) formatRupiah(amount float64) string {
	amountStr := strconv.FormatFloat(amount, 'f', 2, 64)
	parts := strings.Split(amountStr, ".")
	integerPart := parts[0]
	decimalPart := parts[1]
	
	var result strings.Builder
	result.WriteString("Rp")
	
	for i, digit := range integerPart {
		if i > 0 && (len(integerPart)-i)%3 == 0 {
			result.WriteString(".")
		}
		result.WriteRune(digit)
	}
	result.WriteString("," + decimalPart)
	return result.String()
}

func (s *telegramServiceImpl) sendMessage(text string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.cfg.TelegramBotToken)
	
	payload := map[string]interface{}{
		"chat_id":    s.cfg.TelegramChatID,
		"text":       text,
		"parse_mode": "HTML",
	}
	
	jsonData, _ := json.Marshal(payload)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		// fmt.Printf("HTTP error: %v\n", err) // to debug
		return err
	}
	defer resp.Body.Close()
	
	// ---------- debugging notification function ----------
	// fmt.Printf("Telegram URL: %s\n", url)
	// fmt.Printf("Telegram payload: %+v\n", payload)

	// body, _ := io.ReadAll(resp.Body)
	// fmt.Printf("Telegram response: %s\n", string(body))

	// if resp.StatusCode != 200 {
		// fmt.Printf("Telegram API error: status %d\n", resp.StatusCode)
	// }
	// ---------- end debugging notification function ----------
	
	return nil
}