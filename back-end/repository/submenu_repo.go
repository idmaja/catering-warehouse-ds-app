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

type SubmenuRepository struct {
	collection *mongo.Collection
}

func NewSubmenuRepository(db *mongo.Client) *SubmenuRepository {
	return &SubmenuRepository{
		collection: database.GetCollection(db, "submenus"),
	}
}

func (r *SubmenuRepository) CreateSubmenu(ctx context.Context, submenu *models.Submenu) error {
	_, err := r.collection.InsertOne(ctx, submenu)
	return err
}

func (r *SubmenuRepository) FindAllSubmenus(ctx context.Context) ([]models.Submenu, error) {
	var submenus []models.Submenu
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &submenus); err != nil {
		return nil, err
	}
	return submenus, nil
}

func (r *SubmenuRepository) FindSubmenuByID(ctx context.Context, id string) (*models.Submenu, error) {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var submenu models.Submenu
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&submenu)
	if err != nil {
		return nil, err
	}
	return &submenu, nil
}

func (r *SubmenuRepository) UpdateSubmenu(ctx context.Context, id string, update interface{}) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, bson.M{"$set": update})
	return err
}

func (r *SubmenuRepository) DeleteSubmenu(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.collection.DeleteOne(ctx, bson.M{"_id": objID})
	return err
}

func (r *SubmenuRepository) CountSubmenus(ctx context.Context) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{})
}

func (r *SubmenuRepository) FindAllSubmenusWithPagination(ctx context.Context, params dto.PaginationParams, search string) ([]models.Submenu, int64, error) {
	var submenus []models.Submenu
	
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
	
	if err = cursor.All(ctx, &submenus); err != nil {
		return nil, 0, err
	}
	
	return submenus, total, nil
}