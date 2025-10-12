package utils

import (
	"strconv"
	"warehouse-trial-gin/dto"

	"github.com/gin-gonic/gin"
)

func GetPaginationParams(ctx *gin.Context, defaultLimit int) dto.PaginationParams {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", strconv.Itoa(defaultLimit)))
	
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = defaultLimit
	}
	
	offset := (page - 1) * limit
	
	return dto.PaginationParams{
		Page:   page,
		Limit:  limit,
		Offset: offset,
	}
}

func CreatePaginationResponse(data interface{}, total int64, params dto.PaginationParams) dto.PaginationResponse {
	totalPages := int((total + int64(params.Limit) - 1) / int64(params.Limit))
	
	return dto.PaginationResponse{
		Data:        data,
		Total:       total,
		TotalPages:  totalPages,
		CurrentPage: params.Page,
		PerPage:     params.Limit,
		HasNext:     params.Page < totalPages,
		HasPrev:     params.Page > 1,
	}
}