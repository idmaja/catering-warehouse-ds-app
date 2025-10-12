package repository

import (
	"context"
	"strconv"
	"time"
	"warehouse-trial-gin/database"
	"warehouse-trial-gin/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type OrderRepository struct {
	collection *mongo.Collection
}

func NewOrderRepository(db *mongo.Client) *OrderRepository {
	return &OrderRepository{
		collection: database.GetCollection(db, "orders"),
	}
}

func (r *OrderRepository) CreateOrder(ctx context.Context, order *models.Order) error {
	_, err := r.collection.InsertOne(ctx, order)
	return err
}

func (r *OrderRepository) FindAllOrders(ctx context.Context) ([]models.Order, error) {
	var orders []models.Order
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &orders); err != nil {
		return nil, err
	}
	return orders, nil
}

func (r *OrderRepository) FindOrdersWithFilters(ctx context.Context, page, limit, status, orderType, dateFilter, search string) ([]models.Order, int64, error) {
	filter := bson.M{}
	
	if status != "" {
		filter["status"] = status
	}
	if orderType != "" {
		filter["type"] = orderType
	}
	if search != "" {
		filter["order_number"] = bson.M{"$regex": search, "$options": "i"}
	}
	
	if dateFilter != "" {
		now := time.Now()
		switch dateFilter {
		case "today":
			startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
			endOfDay := startOfDay.Add(24 * time.Hour)
			filter["created_at"] = bson.M{"$gte": startOfDay, "$lt": endOfDay}
		case "week":
			weekAgo := now.AddDate(0, 0, -7)
			filter["created_at"] = bson.M{"$gte": weekAgo}
		case "month":
			startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
			filter["created_at"] = bson.M{"$gte": startOfMonth}
		case "quarter":
			quarterStart := time.Date(now.Year(), time.Month(((int(now.Month())-1)/3)*3+1), 1, 0, 0, 0, 0, now.Location())
			filter["created_at"] = bson.M{"$gte": quarterStart}
		}
	}
	
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	
	pageNum, _ := strconv.Atoi(page)
	limitNum, _ := strconv.Atoi(limit)
	if pageNum < 1 {
		pageNum = 1
	}
	if limitNum < 1 {
		limitNum = 10
	}
	
	skip := (pageNum - 1) * limitNum
	
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(int64(skip)).
		SetLimit(int64(limitNum))
	
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	
	var orders []models.Order
	if err = cursor.All(ctx, &orders); err != nil {
		return nil, 0, err
	}
	
	return orders, total, nil
}

func (r *OrderRepository) FindOrderByID(ctx context.Context, id string) (*models.Order, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var order models.Order
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&order)
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) UpdateOrderStatus(ctx context.Context, id string, status models.OrderStatus) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": bson.M{"status": status}})
	return err
}

func (r *OrderRepository) DeleteOrder(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}