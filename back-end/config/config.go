package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	MongoURI          string
	DBName            string
	JWTSecret         string
	GoogleClientID    string
	GoogleClientSecret string
	SuperAdminEmail   string
	TelegramBotToken  string
	TelegramChatID    string
}

func LoadConfig() Config {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	return Config{
		Port:              os.Getenv("PORT"),
		MongoURI:          os.Getenv("MONGODB_URI"),
		DBName:            os.Getenv("DB_NAME"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		GoogleClientID:    os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		SuperAdminEmail:   os.Getenv("SUPERADMIN_EMAIL"),
		TelegramBotToken:  os.Getenv("TELEGRAM_BOT_TOKEN"),
		TelegramChatID:    os.Getenv("TELEGRAM_CHAT_ID"),
	}
}
