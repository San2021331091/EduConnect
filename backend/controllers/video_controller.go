package controllers

import (
	"fiber-backend/config"
	"fiber-backend/models"
)

// JoinVideo adds a user to the video channel
func JoinVideo(state *models.VideoState) error {
	
	config.DB.
		Where("user_id = ?", state.UserID).
		Delete(&models.VideoState{})

	// Add new state
	return config.DB.Create(state).Error
}

// LeaveVideo removes a user from the video channel
func LeaveVideo(userID string) error {
	return config.DB.
		Where("user_id = ?", userID).
		Delete(&models.VideoState{}).
		Error
}
