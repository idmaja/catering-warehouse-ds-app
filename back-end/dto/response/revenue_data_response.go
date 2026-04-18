package response

type RevenueDataResponse struct {
	Period  string  `json:"period"`
	Revenue float64 `json:"revenue"`
}