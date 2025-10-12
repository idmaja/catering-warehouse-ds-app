package database

import (
	"context"
	"log"
	"time"
	"warehouse-trial-gin/config"
	"warehouse-trial-gin/utils"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Client

func ConnectDB(cfg config.Config) {
	utils.LogInfo("Connecting to MongoDB...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		utils.LogError("Failed to connect to MongoDB", err)
		log.Fatal("DB Error : ", err)
	}

	// ping untuk tes koneksi
	if err := client.Ping(ctx, nil); err != nil {
		utils.LogError("MongoDB ping failed", err)
		log.Fatal("DB ping failed:", err)
	}

	utils.LogInfo("Successfully connected to MongoDB")
	DB = client
}

func GetCollection(client *mongo.Client, collectionName string) *mongo.Collection {
	return client.Database(config.LoadConfig().DBName).Collection(collectionName)
}
