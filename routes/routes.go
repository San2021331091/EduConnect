package routes

import (
	"fmt"
	"log"
	"os"
	"time"

	"fiber-backend/controllers"
	"fiber-backend/models"

	"fiber-backend/realtime"

	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v3"
	"github.com/gofiber/websocket/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

// SetupRoutes sets up all routes for the Fiber app
func SetupRoutes(app *fiber.App) {

	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	secret := os.Getenv("SUPABASE_JWT_SECRET")
	if secret == "" {
		log.Fatal("SUPABASE_JWT_SECRET not set in .env")
	}

	// ---------------- JWT Middleware ----------------
	jwtMiddleware := jwtware.New(jwtware.Config{
		SigningKey: []byte(secret),
		ContextKey: "user",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Unauthorized",
			})
		},
	})

	// Root route
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Welcome to your server",
			"status":  "running",
		})
	})


	// ---------------- SIGNUP ----------------
	app.Post("/signup", func(c *fiber.Ctx) error {
		var body struct {
			UserID string `json:"userId"`
			Email  string `json:"email"`
		}

		// Parse body
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": "Invalid request body",
			})
		}

		if body.UserID == "" || body.Email == "" {
			return c.Status(400).JSON(fiber.Map{
				"error": "userId and email are required",
			})
		}

		// Create profile in DB
		profile, err := controllers.CreateUserAndProfile(body.UserID, body.Email)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		return c.Status(201).JSON(profile)
	})

	// ---------------- LOGIN ----------------
	app.Post("/login", func(c *fiber.Ctx) error {
		var body struct {
			Token string `json:"token"` // Supabase access token
		}

		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
		}
		if body.Token == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Token is required"})
		}

		// 1️⃣ Verify Supabase JWT
		supabaseToken, _, err := new(jwt.Parser).ParseUnverified(body.Token, jwt.MapClaims{})
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token"})
		}

		claims := supabaseToken.Claims.(jwt.MapClaims)
		userID, ok := claims["sub"].(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid token claims"})
		}

		profile, err := controllers.GetProfileByID(userID)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Profile not found"})
		}

		fiberToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"sub": userID,
			"exp": jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		})
		signedToken, err := fiberToken.SignedString([]byte(os.Getenv("SUPABASE_JWT_SECRET")))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Could not create token"})
		}

		return c.JSON(fiber.Map{
			"token":   signedToken,
			"profile": profile,
		})
	})

	// ---------------- PROFILES ----------------
	app.Post("/profiles", jwtMiddleware, func(c *fiber.Ctx) error {
		var profile models.Profile
		if err := c.BodyParser(&profile); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		token := c.Locals("user").(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)
		profile.UserID = claims["sub"].(string)

		if err := controllers.CreateProfile(&profile); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(profile)
	})

	// ---------------- GET PROFILE ----------------
	app.Get("/profiles/:profileId", jwtMiddleware, func(c *fiber.Ctx) error {
		profileId := c.Params("profileId")
		if profileId == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Profile ID is required"})
		}

		profile, err := controllers.GetProfileByID(profileId)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Profile not found"})
		}

		return c.JSON(profile)
	})

	// Update profile
	app.Put("/profiles/:id", jwtMiddleware, controllers.ProfileOwnershipMiddleware, func(c *fiber.Ctx) error {
		userID := c.Params("id")

		profile, err := controllers.GetProfileByID(userID)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Profile not found"})
		}

		if err := c.BodyParser(&profile); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		if err := controllers.UpdateProfile(&profile); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(profile)
	})

	// Delete profile
	app.Delete("/profiles/:id", jwtMiddleware, controllers.ProfileOwnershipMiddleware, func(c *fiber.Ctx) error {
		userID := c.Params("id")

		if err := controllers.DeleteProfile(userID); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.SendStatus(204)
	})

	// ---------------- SERVERS ----------------
	app.Post("/servers", jwtMiddleware, func(c *fiber.Ctx) error {
		var serverInput struct {
			Name      string `json:"name"`
			ImageURL  string `json:"imageURL"`
			ProfileID string `json:"profileID"`
		}

		if err := c.BodyParser(&serverInput); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		// Get user ID from JWT
		token := c.Locals("user").(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)
		userID := claims["sub"].(string)

		// 🏠 Create Server
		server := models.Server{
			Name:       serverInput.Name,
			ImageURL:   serverInput.ImageURL,
			ProfileID:  serverInput.ProfileID,
			UserID:     userID,
			InviteCode: uuid.NewString(),
		}

		if err := controllers.CreateServer(&server); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		// Create default "general" channel
		channel := models.Channel{
			Name:      "general",
			ServerID:  server.ID,
			UserID:    userID,
			ProfileID: serverInput.ProfileID,
		}

		if err := controllers.CreateChannel(&channel); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Server created but channel failed"})
		}

		// 👑 Create ADMIN member
		member := models.Member{
			ServerID:  server.ID,
			ProfileID: serverInput.ProfileID,
			UserID:    userID,
			Role:      "ADMIN",
		}

		if err := controllers.CreateMember(&member); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Server created but member failed"})
		}

		return c.Status(201).JSON(server)
	})

	app.Get("/servers", jwtMiddleware, func(c *fiber.Ctx) error {
		servers, err := controllers.GetAllServers()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.JSON(servers)
	})

	app.Get("/servers/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		server, err := controllers.GetServerByID(id)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Server not found"})
		}
		return c.JSON(server)
	})
	
	app.Put("/servers/:id", jwtMiddleware, func(c *fiber.Ctx) error {
	id := c.Params("id")

	server, err := controllers.GetServerByID(id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "Server not found",
		})
	}

	var body struct {
		Name string `json:"name"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if body.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "Server name is required",
		})
	}

	server.Name = body.Name

	if err := controllers.UpdateServer(&server); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(server)
})


	app.Delete("/servers/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		if err := controllers.DeleteServer(id); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.SendStatus(204)
	})

	app.Post("/servers/:inviteCode", jwtMiddleware, func(c *fiber.Ctx) error {
		inviteCode := c.Params("inviteCode")

		token := c.Locals("user").(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)
		userID := claims["sub"].(string)

		server, err := controllers.JoinServerByInvite(inviteCode, userID)
		if err != nil {
			fmt.Println("JoinServerByInvite failed:", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": err.Error(),
			})
		}

		return c.JSON(server)
	})

	// ---------------- MEMBERS ----------------
	app.Post("/members", jwtMiddleware, func(c *fiber.Ctx) error {
		var member models.Member
		if err := c.BodyParser(&member); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		token := c.Locals("user").(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)
		member.UserID = claims["sub"].(string)

		if err := controllers.CreateMember(&member); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(member)
	})

	app.Get("/members/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		member, err := controllers.GetMemberByID(id)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
		}
		return c.JSON(member)
	})

	app.Put("/members/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		member, err := controllers.GetMemberByID(id)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Member not found"})
		}

		var body struct {
			Role string `json:"role"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		member.Role = models.MemberRole(body.Role)

		if err := controllers.UpdateMember(&member); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(member)

	})

	app.Delete("/members/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		if err := controllers.DeleteMember(id); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.SendStatus(204)
	})

	// ---------------- CHANNELS ----------------
	app.Post("/channels", jwtMiddleware, func(c *fiber.Ctx) error {
		var channel models.Channel
		if err := c.BodyParser(&channel); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		if channel.ProfileID == "" {
			return c.Status(400).JSON(fiber.Map{"error": "profileID is required"})
		}

		token := c.Locals("user").(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)
		channel.UserID = claims["sub"].(string)

		if err := controllers.CreateChannel(&channel); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(channel)
	})

	app.Get("/channels/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		channel, err := controllers.GetChannelByID(id)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Channel not found"})
		}
		return c.JSON(channel)
	})

	app.Put("/channels/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		channel, err := controllers.GetChannelByID(id)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Channel not found"})
		}

		if err := c.BodyParser(&channel); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		if err := controllers.UpdateChannel(&channel); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(channel)
	})

	app.Delete("/channels/:id", jwtMiddleware, func(c *fiber.Ctx) error {
		id := c.Params("id")
		if err := controllers.DeleteChannel(id); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.SendStatus(204)
	})

	app.Post("/voice/join", jwtMiddleware, func(c *fiber.Ctx) error {
		var body struct {
			ServerID  string `json:"serverId"`
			ChannelID string `json:"channelId"`
			ProfileID string `json:"profileId"`
		}

		if err := c.BodyParser(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		token := c.Locals("user").(*jwt.Token)
		claims := token.Claims.(jwt.MapClaims)

		state := models.VoiceState{
			ID:        uuid.NewString(),
			UserID:    claims["sub"].(string),
			ServerID:  body.ServerID,
			ChannelID: body.ChannelID,
			ProfileID: body.ProfileID,
			Muted:     false,
		}

		if err := controllers.JoinVoice(&state); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(state)
	})
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/voice/:channelId", websocket.New(realtime.VoiceWebSocket))

	// Video channel REST endpoints
	app.Post("/video/join", func(c *fiber.Ctx) error {
		state := new(models.VideoState)
		if err := c.BodyParser(state); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		if err := controllers.JoinVideo(state); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "Joined video channel"})
	})

	app.Post("/video/leave", func(c *fiber.Ctx) error {
		type Req struct {
			UserID string `json:"userID"`
		}
		req := new(Req)
		if err := c.BodyParser(req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}
		if err := controllers.LeaveVideo(req.UserID); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"message": "Left video channel"})
	})

	// Video WebSocket endpoint
	app.Get("/ws/video/:channelId/:userId", websocket.New(realtime.VideoWebSocket))
	//Text Websocket endpoint
	app.Get("/ws/channel/:channelId", websocket.New(realtime.TextChannelWebSocket))

}
