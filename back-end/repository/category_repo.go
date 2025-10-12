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

// type CategoryRepository interface {
// 	CreateCategory(ctx context.Context, category *models.Category) error
// 	GetAllCategories(ctx context.Context) ([]models.Category, error)
// 	GetCategoryByID(ctx context.Context, id primitive.ObjectID) (*models.Category, error)
// 	UpdateCategory(ctx context.Context, id primitive.ObjectID, category *models.Category) error
// 	DeleteCategory(ctx context.Context, id primitive.ObjectID) error
// 	CountCategories(ctx context.Context) (int64, error)
// }

type CategoryRepository struct {
	collection *mongo.Collection
}

func NewCategoryRepository(db *mongo.Client) *CategoryRepository {
	return &CategoryRepository{
		collection: database.GetCollection(db, "categories"),
	}
}

func (r *CategoryRepository) CreateCategory(ctx context.Context, category *models.Category) error {
	_, err := r.collection.InsertOne(ctx, category)
	return err
}

func (r *CategoryRepository) GetAllCategories(ctx context.Context) ([]models.Category, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []models.Category
	if err = cursor.All(ctx, &categories); err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *CategoryRepository) GetCategoryByID(ctx context.Context, id primitive.ObjectID) (*models.Category, error) {
	var category models.Category
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&category)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *CategoryRepository) UpdateCategory(ctx context.Context, id primitive.ObjectID, category *models.Category) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": category})
	return err
}

func (r *CategoryRepository) DeleteCategory(ctx context.Context, id primitive.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *CategoryRepository) CountCategories(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{})
}

func (r *CategoryRepository) GetAllCategoriesWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.Category, int64, error) {
	var categories []models.Category
	
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