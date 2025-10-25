package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

type Proyek struct {
	ID            int     `json:"id"`
	NIK           string  `json:"nik"`
	NamaProyek    string  `json:"nama_proyek"`
	Lokasi        string  `json:"lokasi"`
	Status        string  `json:"status"`
	Anggaran      float64 `json:"anggaran"`
	TahunAnggaran int     `json:"tahun_anggaran"`
	Keterangan    string  `json:"keterangan"`
}

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Count   int         `json:"count,omitempty"`
	Error   string      `json:"error,omitempty"`
}

var db *sql.DB

func initDatabase() error {
	var err error

	// Database configuration
	dbHost := getEnv("DB_HOST", "db-pu")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPass := getEnv("DB_PASSWORD", "mysql123")
	dbName := getEnv("DB_NAME", "pu_db")

	// Connection string
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPass, dbHost, dbPort, dbName)

	// Retry logic
	maxRetries := 30
	for i := 0; i < maxRetries; i++ {
		db, err = sql.Open("mysql", dsn)
		if err == nil {
			err = db.Ping()
			if err == nil {
				log.Println("Database connected successfully!")
				break
			}
		}
		log.Printf("Retry %d/%d: %v\n", i+1, maxRetries, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		return fmt.Errorf("failed to connect to database after %d retries: %v", maxRetries, err)
	}

	// Create table
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS proyek (
		id INT AUTO_INCREMENT PRIMARY KEY,
		nik VARCHAR(20) NOT NULL,
		nama_proyek VARCHAR(200) NOT NULL,
		lokasi VARCHAR(200) NOT NULL,
		status VARCHAR(50) NOT NULL,
		anggaran DECIMAL(15, 2) DEFAULT 0,
		tahun_anggaran INT NOT NULL,
		keterangan TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		INDEX idx_nik (nik)
	)`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		return fmt.Errorf("failed to create table: %v", err)
	}

	// Check if data exists
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM proyek").Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check data: %v", err)
	}

	// Auto-seed data if empty (optional - can be disabled with env AUTO_SEED=false)
	if count == 0 && os.Getenv("AUTO_SEED") != "false" {
		// Try to load from seed file
		seedFile := "/app/seed_data.sql"
		if sqlBytes, err := os.ReadFile(seedFile); err == nil {
			_, err = db.Exec(string(sqlBytes))
			if err != nil {
				log.Printf("Failed to execute seed SQL: %v\n", err)
			} else {
				log.Println("Data seeded from SQL file successfully!")
			}
		} else {
			log.Printf("Seed file not found, skipping auto-seed")
		}
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":   "healthy",
		"service":  "Dinas Pekerjaan Umum",
		"database": "MySQL",
	})
}

func getProyekByNIK(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	nik := r.URL.Query().Get("nik")
	if nik == "" {
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Parameter NIK diperlukan",
		})
		return
	}

	rows, err := db.Query("SELECT id, nik, nama_proyek, lokasi, status, anggaran, tahun_anggaran, keterangan FROM proyek WHERE nik = ?", nik)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	var proyeks []Proyek
	for rows.Next() {
		var p Proyek
		err := rows.Scan(&p.ID, &p.NIK, &p.NamaProyek, &p.Lokasi, &p.Status, &p.Anggaran, &p.TahunAnggaran, &p.Keterangan)
		if err != nil {
			continue
		}
		proyeks = append(proyeks, p)
	}

	if len(proyeks) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Data proyek tidak ditemukan",
		})
		return
	}

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Data:    proyeks,
		Count:   len(proyeks),
	})
}

func getAllProyek(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, nik, nama_proyek, lokasi, status, anggaran, tahun_anggaran, keterangan FROM proyek ORDER BY nama_proyek")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}
	defer rows.Close()

	var proyeks []Proyek
	for rows.Next() {
		var p Proyek
		err := rows.Scan(&p.ID, &p.NIK, &p.NamaProyek, &p.Lokasi, &p.Status, &p.Anggaran, &p.TahunAnggaran, &p.Keterangan)
		if err != nil {
			continue
		}
		proyeks = append(proyeks, p)
	}

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Data:    proyeks,
		Count:   len(proyeks),
	})
}

func getProyekByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	vars := mux.Vars(r)
	id := vars["id"]

	var p Proyek
	err := db.QueryRow("SELECT id, nik, nama_proyek, lokasi, status, anggaran, tahun_anggaran, keterangan FROM proyek WHERE id = ?", id).
		Scan(&p.ID, &p.NIK, &p.NamaProyek, &p.Lokasi, &p.Status, &p.Anggaran, &p.TahunAnggaran, &p.Keterangan)

	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Proyek tidak ditemukan",
		})
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	json.NewEncoder(w).Encode(Response{
		Success: true,
		Data:    p,
	})
}

func main() {
	// Initialize database
	if err := initDatabase(); err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Setup router
	r := mux.NewRouter()

	// Routes
	r.HandleFunc("/health", healthCheck).Methods("GET")
	r.HandleFunc("/proyek", getAllProyek).Methods("GET").Queries()
	r.HandleFunc("/proyek", getProyekByNIK).Methods("GET").Queries("nik", "{nik}")
	r.HandleFunc("/proyek/{id:[0-9]+}", getProyekByID).Methods("GET")

	// Apply CORS middleware
	handler := enableCORS(r)

	// Start server
	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
