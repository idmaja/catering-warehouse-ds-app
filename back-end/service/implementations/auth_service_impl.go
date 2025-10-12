package implementations

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
	"warehouse-trial-gin/config"
	"warehouse-trial-gin/dto"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/models"
	"warehouse-trial-gin/repository"
	"warehouse-trial-gin/service"

	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

type authServiceImpl struct {
	userRepo     repository.UserRepository
	cfg          config.Config
	auditService service.AuditService
}

func NewAuthService(userRepo repository.UserRepository, cfg config.Config, auditService service.AuditService) service.AuthService {
	return &authServiceImpl{
		userRepo:     userRepo,
		cfg:          cfg,
		auditService: auditService,
	}
}

func (s *authServiceImpl) Login(ctx context.Context, req request.LoginRequest) (string, error) {
	user, err := s.userRepo.FindByUsername(ctx, req.Username)
	if err != nil {
		return "", errors.New("account not found. Please contact administrator to create your account")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // Token berlaku 1 jam
	})

	tokenString, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", errors.New("failed to generate token")
	}

	return tokenString, nil
}

func (s *authServiceImpl) CreateUser(ctx context.Context, req *request.CreateUserRequest) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  string(hashedPassword),
		Role:      req.Role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.userRepo.CreateUser(ctx, user); err != nil {
		return nil, errors.New("failed to create user")
	}

	// Log activity
	go s.auditService.LogActivity(ctx, "superadmin", "CREATE", "user", "Created user: "+user.Username, "", "")

	return user, nil
}

func (s *authServiceImpl) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	user, err := s.userRepo.FindByID(ctx, objectID)
	if err != nil {
		return nil, errors.New("user not found")
	}

	return user, nil
}

func (s *authServiceImpl) GetAllUsers(ctx context.Context) ([]models.User, error) {
	users, err := s.userRepo.FindAllUsers(ctx)
	if err != nil {
		return nil, errors.New("failed to retrieve users")
	}

	return users, nil
}

func (s *authServiceImpl) GetAllUsersWithPagination(ctx context.Context, params dto.PaginationParams) ([]models.User, int64, error) {
	users, total, err := s.userRepo.FindAllUsersWithPagination(ctx, params)
	if err != nil {
		return nil, 0, errors.New("failed to retrieve users")
	}

	return users, total, nil
}

func (s *authServiceImpl) UpdateUser(ctx context.Context, id string, req *request.UpdateUserRequest) error {
	
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	user, err := s.userRepo.FindByID(ctx, objectID)
	if err != nil {
		return errors.New("user not found")
	}
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return errors.New("failed to hash password")
		}
		user.Password = string(hashedPassword)
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	user.UpdatedAt = time.Now()
	err = s.userRepo.UpdateUser(ctx, user)
	if err == nil {
		// Log activity
		go s.auditService.LogActivity(ctx, "superadmin", "UPDATE", "user", "Updated user: "+user.Username, "", "")
	}
	return err
}

func (s *authServiceImpl) GoogleAuth(ctx context.Context, req request.GoogleAuthRequest) (string, error) {
	// Verify Google token
	oauth2Service, err := oauth2.NewService(ctx, option.WithAPIKey(""))
	if err != nil {
		return "", errors.New("failed to create oauth2 service")
	}

	tokenInfo, err := oauth2Service.Tokeninfo().AccessToken(req.Token).Context(ctx).Do()
	if err != nil {
		return "", errors.New("invalid google token")
	}

	// Check if user exists
	user, err := s.userRepo.FindByEmail(ctx, tokenInfo.Email)
	if err != nil {
		// Create new user
		role := "user"
		if tokenInfo.Email == s.cfg.SuperAdminEmail {
			role = "superadmin"
		}

		user = &models.User{
			Email:     tokenInfo.Email,
			Username:  tokenInfo.Email,
			GoogleID:  tokenInfo.UserId,
			Role:      role,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := s.userRepo.CreateUser(ctx, user); err != nil {
			return "", errors.New("failed to create user")
		}
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", errors.New("failed to generate token")
	}

	return tokenString, nil
}

func (s *authServiceImpl) GoogleCallback(ctx context.Context, code string) (string, string, error) {
	// Exchange authorization code for access token
	tokenURL := "https://oauth2.googleapis.com/token"
	data := url.Values{}
	data.Set("client_id", s.cfg.GoogleClientID)
	data.Set("client_secret", s.cfg.GoogleClientSecret)
	data.Set("code", code)
	data.Set("grant_type", "authorization_code")
	data.Set("redirect_uri", "http://localhost:8080/api/v1/auth/google/callback")

	resp, err := http.PostForm(tokenURL, data)
	if err != nil {
		return "", "", errors.New("failed to exchange code for token")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", errors.New("failed to read token response")
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int    `json:"expires_in"`
	}

	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", "", errors.New("failed to parse token response")
	}

	// Get user info from Google
	userInfoURL := fmt.Sprintf("https://www.googleapis.com/oauth2/v2/userinfo?access_token=%s", tokenResp.AccessToken)
	userResp, err := http.Get(userInfoURL)
	if err != nil {
		return "", "", errors.New("failed to get user info")
	}
	defer userResp.Body.Close()

	userBody, err := io.ReadAll(userResp.Body)
	if err != nil {
		return "", "", errors.New("failed to read user info")
	}

	var userInfo struct {
		ID    string `json:"id"`
		Email string `json:"email"`
		Name  string `json:"name"`
	}

	if err := json.Unmarshal(userBody, &userInfo); err != nil {
		return "", "", errors.New("failed to parse user info")
	}

	// Check if user exists
	user, err := s.userRepo.FindByEmail(ctx, userInfo.Email)
	if err != nil {
		return "", userInfo.Email, errors.New("account not found. Please contact administrator to create your account")
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": user.Username,
		"email":    user.Email,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", userInfo.Email, errors.New("failed to generate token")
	}

	return tokenString, userInfo.Email, nil
}

func (s *authServiceImpl) DeleteUser(ctx context.Context, id string) error {
	err := s.userRepo.DeleteUser(ctx, id)	
	if err != nil {
		return errors.New("failed to delete user")
	}

	go s.auditService.LogActivity(ctx, "superadmin", "DELETE", "user", "Deleted user ID: "+id, "", "")
	return nil
}