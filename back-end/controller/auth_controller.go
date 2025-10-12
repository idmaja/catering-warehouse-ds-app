package controller

import (
	"fmt"
	"net/http"
	"warehouse-trial-gin/config"
	"warehouse-trial-gin/dto/request"
	"warehouse-trial-gin/dto/response"
	"warehouse-trial-gin/service"
	"warehouse-trial-gin/utils"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService     service.AuthService
	auditService    service.AuditService
	telegramService service.TelegramService
}

func NewAuthController(authService service.AuthService, auditService service.AuditService, telegramService service.TelegramService) *AuthController {
	return &AuthController{
		authService:     authService,
		auditService:    auditService,
		telegramService: telegramService,
	}
}

func (c *AuthController) Login(ctx *gin.Context) {
	var req request.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid login request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}

	utils.LogInfo("Login attempt", map[string]interface{}{"username": req.Username})
	go c.auditService.LogActivity(ctx, req.Username, "LOGIN_ATTEMPT", "auth", "User attempted to login", "", "")
	utils.LogInfo("Sending login attempt notification", map[string]interface{}{"username": req.Username})
	go c.telegramService.SendLoginNotification(req.Username, "LOGIN_ATTEMPT", "User attempted to login")
	
	token, err := c.authService.Login(ctx, req)
	if err != nil {
		utils.LogWarn("Login failed", map[string]interface{}{"username": req.Username, "error": err.Error()})
		go c.auditService.LogActivity(ctx, req.Username, "LOGIN_FAILED", "auth", "Login failed: "+err.Error(), "", "")
		
		// Check if it's an unregistered user
		if err.Error() == "account not found. Please contact administrator to create your account" {
			go c.telegramService.SendLoginNotification(req.Username, "UNREGISTERED_LOGIN_ATTEMPT", 
				fmt.Sprintf("⚠️ Unregistered user '%s' attempted to login. Please create an account for this user if they should have access.", req.Username))
		} else {
			go c.telegramService.SendLoginNotification(req.Username, "LOGIN_FAILED", "Login failed: "+err.Error())
		}
		
		response.RespondJSON(ctx.Writer, http.StatusUnauthorized, "error", err.Error(), nil)
		return
	}
	
	utils.LogInfo("Login successful", map[string]interface{}{"username": req.Username})
	go c.auditService.LogActivity(ctx, req.Username, "LOGIN_SUCCESS", "auth", "User logged in successfully", "", "")
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Login successful", gin.H{"token": token})
}

func (c *AuthController) CreateUser(ctx *gin.Context) {
	var req request.CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid create user request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}
		
	utils.LogInfo("Creating new User", map[string]interface{}{"username": req.Username, "role": req.Role})
	user, err := c.authService.CreateUser(ctx, &req)
	
	if err != nil {
		utils.LogError("Failed to create user", err, map[string]interface{}{"username": req.Username})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to create user", nil)
		return
	}

	utils.LogInfo("User created successfully", map[string]interface{}{"username": req.Username})
	response.RespondJSON(ctx.Writer, http.StatusCreated, "success", "User created successfully", user)
}

func (c *AuthController) GetUserByID(ctx *gin.Context) {
	id := ctx.Param("id")
	user, err := c.authService.GetUserByID(ctx, id)
	if err != nil {
		utils.LogError("Failed to retrieve user", err, map[string]interface{}{"user_id": id})
		response.RespondJSON(ctx.Writer, http.StatusNotFound, "error", "User not found", nil)
		return
	}

	utils.LogInfo("User retrieved successfully", map[string]interface{}{"user_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "User found", user)
}

func (c *AuthController) GetAllUsers(ctx *gin.Context) {
	params := utils.GetPaginationParams(ctx, 5)
	users, total, err := c.authService.GetAllUsersWithPagination(ctx, params)
	if err != nil {
		utils.LogError("Failed to retrieve users", err, nil)
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to retrieve users", nil)
		return
	}
	paginatedResponse := utils.CreatePaginationResponse(users, total, params)
	utils.LogInfo("Users retrieved successfully", nil)
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "Users retrieved successfully", paginatedResponse)
}

func (c *AuthController) UpdateUser(ctx *gin.Context) {
	id := ctx.Param("id")
	var req request.UpdateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.LogWarn("Invalid update user request", map[string]interface{}{"error": err.Error()})
		response.RespondJSON(ctx.Writer, http.StatusBadRequest, "error", "Invalid request body", nil)
		return
	}
	err := c.authService.UpdateUser(ctx, id, &req)
	if err != nil {
		utils.LogError("Failed to update user", err, map[string]interface{}{"user_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to update user", nil)
		return
	}
	utils.LogInfo("User updated successfully", map[string]interface{}{"user_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "User updated successfully", nil)
}

func (c *AuthController) GoogleAuth(ctx *gin.Context) {
	cfg := config.LoadConfig()
	googleOAuthURL := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/auth?client_id=%s&redirect_uri=%s&scope=%s&response_type=code",
		cfg.GoogleClientID,
		"http://localhost:8080/api/v1/auth/google/callback",
		"openid email profile",
	)
	ctx.Redirect(http.StatusTemporaryRedirect, googleOAuthURL)
}

func (c *AuthController) GoogleCallback(ctx *gin.Context) {
	code := ctx.Query("code")
	if code == "" {
		utils.LogWarn("Missing authorization code in callback", nil)
		go c.auditService.LogActivity(ctx, "unknown", "GOOGLE_LOGIN_FAILED", "auth", "Missing authorization code", "", "")
		ctx.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/login")
		return
	}

	token, email, err := c.authService.GoogleCallback(ctx, code)
	
	utils.LogInfo("Google OAuth callback received", map[string]interface{}{"code": code[:10] + "..."})
	go c.telegramService.SendLoginNotification(email, "GOOGLE_LOGIN_ATTEMPT", "Google login attempted")
	if err != nil {
		utils.LogWarn("Google callback failed", map[string]interface{}{"error": err.Error()})
		go c.auditService.LogActivity(ctx, "unknown", "GOOGLE_LOGIN_FAILED", "auth", "Google callback failed: "+err.Error(), "", "")
		
		// Check if it's an unregistered user
		if err.Error() == "account not found. Please contact administrator to create your account" {
			go c.telegramService.SendLoginNotification(email, "UNREGISTERED_GOOGLE_LOGIN", 
				fmt.Sprintf("⚠️ Unregistered Google user '%s' attempted to login. Please create an account for this user if they should have access.", email))
		}
		
		ctx.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/login")
		return
	}

	utils.LogInfo("Google callback successful", nil)
	go c.auditService.LogActivity(ctx, email, "GOOGLE_LOGIN_SUCCESS", "auth", "Google login successful", "", "")
	ctx.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/auth/callback?token="+token)
}

func (c *AuthController) DeleteUser(ctx *gin.Context) {
	id := ctx.Param("id")
	utils.LogInfo("Deleting user", map[string]interface{}{"user_id": id})
	err := c.authService.DeleteUser(ctx, id)
	if err != nil {
		utils.LogError("Failed to delete user", err, map[string]interface{}{"user_id": id})
		response.RespondJSON(ctx.Writer, http.StatusInternalServerError, "error", "Failed to delete user", nil)
		return
	}
	utils.LogInfo("User deleted successfully", map[string]interface{}{"user_id": id})
	response.RespondJSON(ctx.Writer, http.StatusOK, "success", "User deleted successfully", nil)
}