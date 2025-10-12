package request

type GoogleAuthRequest struct {
	Token string `json:"token" binding:"required"`
}