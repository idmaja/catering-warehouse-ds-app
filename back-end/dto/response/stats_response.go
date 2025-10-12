package response

type StatsResponse struct {
	TotalItems      int64 `json:"totalItems"`
	LowStock        int64 `json:"lowStock"`
	TotalCategories int64 `json:"totalCategories"`
}