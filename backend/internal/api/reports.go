package api

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

type Report struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Data        Data      `json:"data"`
}

type Data struct {
	SomeData string `json:"some_data"`
}

func ReportsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	reports := generateMockReports()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    reports,
		"count":   len(reports),
	})
}

func generateMockReports() []Report {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	numReports := r.Intn(11) + 5
	reports := make([]Report, numReports)

	for i := range reports {
		createdAt := time.Now().AddDate(0, 0, -r.Intn(365))
		reports[i] = Report{
			ID:          generateRandomID(),
			Title:       "Title",
			Description: "Description",
			CreatedAt:   createdAt,
			UpdatedAt:   createdAt.AddDate(0, 0, r.Intn(30)),
			Data:        Data{SomeData: "Some data"},
		}
	}
	return reports
}

func generateRandomID() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 12)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
