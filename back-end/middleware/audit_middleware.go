package middlewares

import (
	"net"
	"strings"
	"warehouse-trial-gin/service"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

func getRealIP(ctx *gin.Context) string {
	// Check X-Forwarded-For header (most common for proxies)
	if xff := ctx.GetHeader("X-Forwarded-For"); xff != "" {
		// Take the first IP in the list
		if ips := strings.Split(xff, ","); len(ips) > 0 {
			ip := strings.TrimSpace(ips[0])
			if ip != "" {
				return ip
			}
		}
	}
	
	// Check X-Real-IP header
	if xri := ctx.GetHeader("X-Real-IP"); xri != "" {
		return xri
	}
	
	// Check X-Forwarded header
	if xf := ctx.GetHeader("X-Forwarded"); xf != "" {
		return xf
	}
	
	// Fall back to RemoteAddr
	ip := ctx.Request.RemoteAddr
	if host, _, err := net.SplitHostPort(ip); err == nil {
		// Convert IPv6 loopback to IPv4 for better readability
		if host == "::1" {
			return "127.0.0.1"
		}
		return host
	}
	// Convert IPv6 loopback to IPv4 for better readability
	if ip == "::1" {
		return "127.0.0.1"
	}
	return ip
}

func AuditMiddleware(auditService service.AuditService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Next()

		// Only log successful requests (status < 400)
		if ctx.Writer.Status() >= 400 {
			return
		}

		claims, exists := ctx.Get("claims")
		if !exists {
			return
		}

		userClaims := claims.(jwt.MapClaims)
		username := userClaims["username"].(string)

		action := ctx.Request.Method
		resource := ctx.Request.URL.Path
		details := "Request completed successfully"
		ipAddress := getRealIP(ctx)
		userAgent := ctx.Request.UserAgent()

		// Log activity asynchronously
		go func() {
			auditService.LogActivity(ctx, username, action, resource, details, ipAddress, userAgent)
		}()
	}
}