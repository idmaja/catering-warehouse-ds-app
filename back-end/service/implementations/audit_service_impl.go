package implementations

import (
	"context"
	"time"
	"warehouse-trial-gin/models"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service"
	// "go.mongodb.org/mongo-driver/bson/primitive"
)

type auditServiceImpl struct {
	auditRepo *repository.AuditRepository
}

func NewAuditService(auditRepo *repository.AuditRepository) service.AuditService {
	return &auditServiceImpl{
		auditRepo: auditRepo,
	}
}

func (s *auditServiceImpl) LogActivity(ctx context.Context, username, action, resource, details, ipAddress, userAgent string) error {
	activity := &models.ActivityLog{
		Username:  username,
		Action:    action,
		Resource:  resource,
		Details:   details,
		IPAddress: ipAddress,
		UserAgent: userAgent,
		Timestamp: time.Now(),
	}

	return s.auditRepo.CreateLog(ctx, activity)
}

func (s *auditServiceImpl) GetAllLogs(ctx context.Context) ([]models.AuditLog, error) {
	return s.auditRepo.FindAllLogs(ctx)
}

func (s *auditServiceImpl) GetLogByID(ctx context.Context, id string) (*models.AuditLog, error) {
	return s.auditRepo.FindLogByID(ctx, id)
}