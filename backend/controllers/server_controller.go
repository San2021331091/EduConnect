package controllers

import (
	"errors"

	"fiber-backend/config"
	"fiber-backend/models"

	"gorm.io/gorm"
)

func CreateServer(server *models.Server) error {
	return config.DB.Create(server).Error
}

func GetAllServers() ([]models.Server, error) {
	var servers []models.Server

	err := config.DB.
		Preload("Profile").
		Preload("Members", func(db *gorm.DB) *gorm.DB {
			return db.Select(
				"id",
				"role",
				"profile_id",
				"user_id",
				"server_id",
				"created_at",
			)
		}).
		Preload("Channels", func(db *gorm.DB) *gorm.DB {
			return db.Select(
				"id",
				"name",
				"type",
				"server_id",
				"created_at",
			)
		}).
		Find(&servers).Error

	return servers, err
}

func GetServerByID(id string) (models.Server, error) {
	var server models.Server
	err := config.DB.
		Preload("Profile").
		Preload("Members").
		Preload("Members.Profile").
		Preload("Channels").
		First(&server, "id = ?", id).Error

	return server, err
}

func JoinServerByInvite(inviteCode string, userID string) (*models.Server, error) {
	var server models.Server

	// 🔍 Find server by invite code
	if err := config.DB.
		Preload("Members").
		Where("invite_code = ?", inviteCode).
		First(&server).Error; err != nil {
		return nil, errors.New("invalid invite code")
	}

	// 🛑 Already a member?
	for _, member := range server.Members {
		if member.UserID == userID {
			return &server, nil
		}
	}

	// 👤 Get profile
	var profile models.Profile
	if err := config.DB.
		Where("user_id = ?", userID).
		First(&profile).Error; err != nil {
		return nil, err
	}

	// ➕ Create GUEST member
	member := models.Member{
		ServerID:  server.ID,
		UserID:    userID,
		ProfileID: profile.UserID,
		Role:      models.GUEST,
	}

	if err := config.DB.Create(&member).Error; err != nil {
		return nil, err
	}

	// 🔄 Return updated server
	if err := config.DB.
		Preload("Profile").
		Preload("Members").
		Preload("Channels").
		First(&server, "id = ?", server.ID).Error; err != nil {
		return nil, err
	}

	return &server, nil
}

func UpdateServer(server *models.Server) error {
	return config.DB.Save(server).Error
}

func DeleteServer(id string) error {
	return config.DB.Delete(&models.Server{}, "id = ?", id).Error
}
