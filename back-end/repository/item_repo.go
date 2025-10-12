package repository

import (
	"context"
	"warehouse-trial-gin/database"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ItemRepository struct {
	collection *mongo.Collection
}

func NewItemRepository(db *mongo.Client) *ItemRepository {
	return &ItemRepository{
		collection: database.GetCollection(db, "items"),
	}
}

func (r *ItemRepository) FindAllItems(ctx context.Context) ([]models.Item, error) {
	var items []models.Item
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &items); err != nil {
		return nil, err
	}

	return items, nil
}

func (r *ItemRepository) FindItemByID(ctx context.Context, id string) (*models.Item, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var item models.Item
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *ItemRepository) CreateItem(ctx context.Context, item *models.Item) error {
	_, err := r.collection.InsertOne(ctx, item)
	return err
}

func (r *ItemRepository) UpdateItem(ctx context.Context, id string, update interface{}) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	// Handle both $set and $inc operations
	if updateMap, ok := update.(map[string]interface{}); ok {
		if _, hasInc := updateMap["$inc"]; hasInc {
			_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
			return err
		}
	}

	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	return err
}

func (r *ItemRepository) DeleteItem(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

func (r *ItemRepository) CountItems(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{})
}

func (r *ItemRepository) CountLowStockItems(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"quantity": bson.M{"$lt": 10}})
}

func (r *ItemRepository) FindAllItemsWithCategories(ctx context.Context) ([]models.Item, error) {
	pipeline := []bson.M{
		{
			"$lookup": bson.M{
				"from":         "categories",
				"localField":   "category_id",
				"foreignField": "_id",
				"as":           "category",
			},
		},
		{
			"$addFields": bson.M{
				"category_name": bson.M{
					"$ifNull": []interface{}{
						bson.M{"$arrayElemAt": []interface{}{"$category.name", 0}},
						"",
					},
				},
				"category_color": bson.M{
					"$ifNull": []interface{}{
						bson.M{"$arrayElemAt": []interface{}{"$category.color", 0}},
						"",
					},
				},
			},
		},
		{
			"$project": bson.M{
				"category": 0,
			},
		},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []models.Item
	if err = cursor.All(ctx, &items); err != nil {
		return nil, err
	}

	return items, nil
}

func (r *ItemRepository) FindAllItemsWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Item, int64, error) {
	var items []models.Item
	
	filter := bson.M{}
	if search != "" {
		filter = bson.M{
			"$or": []bson.M{
				{"name": bson.M{"$regex": search, "$options": "i"}},
				{"sku": bson.M{"$regex": search, "$options": "i"}},
			},
		}
	}
	
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}
	
	opts := options.Find()
	opts.SetSkip(int64(params.Offset))
	opts.SetLimit(int64(params.Limit))
	
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	
	if err = cursor.All(ctx, &items); err != nil {
		return nil, 0, err
	}
	
	return items, total, nil
}