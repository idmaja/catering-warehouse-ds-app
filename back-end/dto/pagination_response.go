package dto

type PaginationResponse struct {
	Data        interface{} `json:"data"`
	Total       int64       `json:"total"`
	TotalPages  int         `json:"total_pages"`
	CurrentPage int         `json:"current_page"`
	PerPage     int         `json:"per_page"`
	HasNext     bool        `json:"has_next"`
	HasPrev     bool        `json:"has_prev"`
}