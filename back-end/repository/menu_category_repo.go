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

type MenuCategoryRepository struct {
	collection *mongo.Collection
}

func NewMenuCategoryRepository(db *mongo.Client) *MenuCategoryRepository {
	return &MenuCategoryRepository{
		collection: database.GetCollection(db, "menu_categories"),
	}
}

func (r *MenuCategoryRepository) CreateMenuCategory(ctx context.Context, category *models.MenuCategory) error {
	_, err := r.collection.InsertOne(ctx, category)
	return err
}

func (r *MenuCategoryRepository) GetAllMenuCategories(ctx context.Context) ([]models.MenuCategory, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []models.MenuCategory
	if err = cursor.All(ctx, &categories); err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *MenuCategoryRepository) GetMenuCategoryByID(ctx context.Context, id primitive.ObjectID) (*models.MenuCategory, error) {
	var category models.MenuCategory
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&category)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *MenuCategoryRepository) UpdateMenuCategory(ctx context.Context, id primitive.ObjectID, category *models.MenuCategory) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": category})
	return err
}

func (r *MenuCategoryRepository) DeleteMenuCategory(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *MenuCategoryRepository) CountMenuCategories(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{})
}

func (r *MenuCategoryRepository) GetAllMenuCategoriesWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.MenuCategory, int64, error) {
	var categories []models.MenuCategory
	
	total, err := r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, 0, err
	}
	
	opts := options.Find()
	opts.SetSkip(int64(params.Offset))
	opts.SetLimit(int64(params.Limit))
	
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)
	
	if err = cursor.All(ctx, &categories); err != nil {
		return nil, 0, err
	}
	
	return categories, total, nil
}