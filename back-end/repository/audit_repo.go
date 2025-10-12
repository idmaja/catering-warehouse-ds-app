package repository

import (
	"context"
	"time"
	"warehouse-trial-gin/database"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type AuditRepository struct {
	collection *mongo.Collection
}

func NewAuditRepository(db *mongo.Client) *AuditRepository {
	return &AuditRepository{
		collection: database.GetCollection(db, "audit_logs"),
	}
}

func (r *AuditRepository) CreateLog(ctx context.Context, activity *models.ActivityLog) error {
	date := activity.Timestamp.Format("2006-01-02")
	
	// Try to find existing log for the date
	filter := bson.M{"date": date}
	update := bson.M{
		"$push": bson.M{"activities": activity},
		"$set":  bson.M{"updated_at": time.Now()},
		"$setOnInsert": bson.M{
			"date":       date,
			"created_at": time.Now(),
		},
	}
	
	opts := options.Update().SetUpsert(true)
	_, err := r.collection.UpdateOne(ctx, filter, update, opts)
	return err
}

func (r *AuditRepository) FindAllLogs(ctx context.Context) ([]models.AuditLog, error) {
	pipeline := []bson.M{
		{"$sort": bson.M{"created_at": -1}},
		{"$addFields": bson.M{
			"activities": bson.M{
				"$sortArray": bson.M{
					"input": "$activities",
					"sortBy": bson.M{"timestamp": -1},
				},
			},
		}},
	}
	
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var logs []models.AuditLog
	if err = cursor.All(ctx, &logs); err != nil {
		return nil, err
	}
	return logs, nil
}

func (r *AuditRepository) FindLogByID(ctx context.Context, id string) (*models.AuditLog, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var log models.AuditLog
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&log)
	if err != nil {
		return nil, err
	}
	return &log, nil
}

func (r *AuditRepository) FindAllLogsWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.AuditLog, int64, error) {
	total, err := r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, 0, err
	}
	
	pipeline := []bson.M{
		{"$sort": bson.M{"created_at": -1}},
		{"$skip": params.Offset},
		{"$limit": params.Limit},
		{"$addFields": bson.M{
			"activities": bson.M{
				"$sortArray": bson.M{
					"input": "$activities",
					"sortBy": bson.M{"timestamp": -1},
				},
			},
		}},
	}
	
	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var logs []models.AuditLog
	if err = cursor.All(ctx, &logs); err != nil {
		return nil, 0, err
	}
	return logs, total, nil
}