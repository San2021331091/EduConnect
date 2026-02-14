package main

import (
	"fiber-backend/config"
	"fiber-backend/models"
	"fiber-backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"log"
)

func main() {
	// Connect to the current database
	config.ConnectDatabase()

	// Auto-migrate models
	err := config.DB.AutoMigrate(
		&models.Profile{},
		&models.Server{},
		&models.Member{},
		&models.Channel{},
		&models.VoiceState{},
		&models.VideoState{},
		&models.Message{},
	)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
	log.Println("Database migrated successfully!")

	// Initialize Fiber app
	app := fiber.New()

	// Enable CORS
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Setup routes
	routes.SetupRoutes(app)

	
	log.Fatal(app.Listen(":8080"))
}
