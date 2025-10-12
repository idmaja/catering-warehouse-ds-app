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

type MenuRepository struct {
	collection *mongo.Collection
}

func NewMenuRepository(db *mongo.Client) *MenuRepository {
	return &MenuRepository{
		collection: database.GetCollection(db, "menus"),
	}
}

func (r *MenuRepository) CreateMenu(ctx context.Context, menu *models.Menu) error {
	_, err := r.collection.InsertOne(ctx, menu)
	return err
}

func (r *MenuRepository) FindAllMenus(ctx context.Context) ([]models.Menu, error) {
	var menus []models.Menu
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &menus); err != nil {
		return nil, err
	}
	return menus, nil
}

func (r *MenuRepository) FindMenuByID(ctx context.Context, id string) (*models.Menu, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var menu models.Menu
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&menu)
	if err != nil {
		return nil, err
	}
	return &menu, nil
}

func (r *MenuRepository) UpdateMenu(ctx context.Context, id string, update interface{}) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	return err
}

func (r *MenuRepository) DeleteMenu(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

func (r *MenuRepository) CountMenus(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{})
}

func (r *MenuRepository) FindAllMenusWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Menu, int64, error) {
	var menus []models.Menu
	
	filter := bson.M{}
	if search != "" {
		filter = bson.M{
			"$or": []bson.M{
				{"title": bson.M{"$regex": search, "$options": "i"}},
				{"description": bson.M{"$regex": search, "$options": "i"}},
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
	
	if err = cursor.All(ctx, &menus); err != nil {
		return nil, 0, err
	}
	
	return menus, total, nil
}