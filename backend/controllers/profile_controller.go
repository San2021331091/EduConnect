package controllers

import (
	"errors"
	"time"

	"fiber-backend/config"
	"fiber-backend/models"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// ---------------- PROFILES ----------------

// CreateProfile inserts a new profile into the database
func CreateProfile(profile *models.Profile) error {
	return config.DB.Create(profile).Error
}

// GetProfileByID fetches a profile by userID (Supabase UUID)
func GetProfileByID(userID string) (models.Profile, error) {
	var profile models.Profile
	err := config.DB.
		Preload("Servers").
		Preload("Members").
		Preload("Channels").
		First(&profile, "user_id = ?", userID).Error

	if err != nil {
		return profile, errors.New("profile not found")
	}

	return profile, nil
}

// UpdateProfile updates profile's Name and ImgURL
func UpdateProfile(profile *models.Profile) error {
	if profile.UserID == "" {
		return errors.New("invalid profile ID")
	}

	profile.UpdatedAt = time.Now()
	return config.DB.Save(profile).Error
}

// DeleteProfile deletes a profile by userID
func DeleteProfile(userID string) error {
	if userID == "" {
		return errors.New("invalid profile ID")
	}

	result := config.DB.Delete(&models.Profile{}, "user_id = ?", userID)
	if result.RowsAffected == 0 {
		return errors.New("profile not found")
	}
	return result.Error
}

// ---------------- USERS ----------------

// GetUserByEmail fetches a profile by email
func GetUserByEmail(email string) (models.Profile, error) {
	var user models.Profile
	err := config.DB.First(&user, "email = ?", email).Error
	if err != nil {
		return user, errors.New("user not found")
	}
	return user, nil
}

// ---------------- SIGNUP ----------------

// CreateUserAndProfile creates profile AFTER Supabase signup
func CreateUserAndProfile(userID, email string) (models.Profile, error) {
	// Check if profile already exists
	existing, err := GetProfileByID(userID)
	if err == nil {
		return existing, errors.New("profile already exists")
	}

	profile := models.Profile{
		UserID: userID, // ✅ Supabase UUID
		Email:  email,
		Name:   "",
	}

	if err := CreateProfile(&profile); err != nil {
		return models.Profile{}, err
	}

	return profile, nil
}


// ProfileOwnershipMiddleware ensures the logged-in user can only modify their own profile
func ProfileOwnershipMiddleware(c *fiber.Ctx) error {
	// Get profileId from route params
	profileId := c.Params("id")
	if profileId == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "profile ID is required",
		})
	}

	// Get userID from JWT (stored by jwtMiddleware in locals)
	token, ok := c.Locals("user").(*jwt.Token)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	claims := token.Claims.(jwt.MapClaims)
	userID, ok := claims["sub"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token",
		})
	}

	// Compare JWT userID with profileId param
	if userID != profileId {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "you can only modify your own profile",
		})
	}

	// Pass to next handler
	return c.Next()
}
