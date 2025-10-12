package main

import (
	"context"
	"log"
	"time"
	"warehouse-trial-gin/config"
	"warehouse-trial-gin/database"

	"warehouse-trial-gin/routes"
	"warehouse-trial-gin/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize logger
	utils.InitLogger()
	utils.LogInfo("Starting Warehouse Management System")

	cfg := config.LoadConfig()
	router := gin.Default()
	
	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	
	database.ConnectDB(cfg)
	utils.LogInfo("Database connection established")

	defer func() {
		if database.DB != nil {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if err := database.DB.Disconnect(ctx); err != nil {
				log.Fatal(err)
			}
			log.Println("Disconnected from DB")
		}
	}()

	routes.SetupRoutes(router, database.DB)
	utils.LogInfo("Routes configured successfully")
	
	// Start daily report scheduler
	utils.StartDailyReportScheduler(nil) // Will be updated in routes
	
	utils.LogInfo("Telegram notifications enabled")
	utils.LogInfo("Server starting on port " + cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		utils.LogError("Failed to start server", err)
	}
}
