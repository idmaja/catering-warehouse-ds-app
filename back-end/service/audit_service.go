package service

import (
	"context"
	"warehouse-trial-gin/models"
)

type AuditService interface {
	LogActivity(ctx context.Context, username, action, resource, details, ipAddress, userAgent string) error
	GetAllLogs(ctx context.Context) ([]models.AuditLog, error)
	GetLogByID(ctx context.Context, id string) (*models.AuditLog, error)
}