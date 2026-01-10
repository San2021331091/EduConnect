package controllers

import (
	"fiber-backend/models"
	config "fiber-backend/config"
)
func JoinVoice(state *models.VoiceState) error {
	config.DB.
		Where("user_id = ?", state.UserID).
		Delete(&models.VoiceState{})

	return config.DB.Create(state).Error
}

func LeaveVoice(userID string) error {
	return config.DB.
		Where("user_id = ?", userID).
		Delete(&models.VoiceState{}).
		Error
}
