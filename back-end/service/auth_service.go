package service

import (
	"context"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
)

type AuthService interface {
	Login(ctx context.Context, req request.LoginRequest) (string, error)
	GoogleAuth(ctx context.Context, req request.GoogleAuthRequest) (string, error)
	GoogleCallback(ctx context.Context, code string) (string, string, error)
	CreateUser(ctx context.Context, req *request.CreateUserRequest) (*models.User, error)
	GetAllUsers(ctx context.Context) ([]models.User, error)
	GetAllUsersWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.User, int64, error)
	GetUserByID(ctx context.Context, id string) (*models.User, error)
	UpdateUser(ctx context.Context, id string, req *request.UpdateUserRequest) error
	DeleteUser(ctx context.Context, id string) error
}