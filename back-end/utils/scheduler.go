package utils

import (
	"time"
	"warehouse-trial-gin/service"
)

func StartDailyReportScheduler(telegramService service.TelegramService) {
	now := time.Now()
	nextMidnight := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())
	timeUntilMidnight := nextMidnight.Sub(now)
	
	time.AfterFunc(timeUntilMidnight, func() {
		telegramService.SendDailyActivityReport()
		telegramService.SendUncompletedOrdersNotification()
		
		ticker := time.NewTicker(24 * time.Hour)
		go func() {
			for range ticker.C {
				telegramService.SendDailyActivityReport()
				telegramService.SendUncompletedOrdersNotification()
			}
		}()
	})
}