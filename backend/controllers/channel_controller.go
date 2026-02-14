package controllers

import (
	"fiber-backend/config"
	"fiber-backend/models"
)

func CreateChannel(channel *models.Channel) error {
	return config.DB.Create(channel).Error
}

func GetChannelByID(id string) (models.Channel, error) {
	var channel models.Channel
	err := config.DB.Preload("Profile").
		Preload("Server").
		First(&channel, "id = ?", id).Error
	return channel, err
}

func UpdateChannel(channel *models.Channel) error {
	return config.DB.Save(channel).Error
}

func DeleteChannel(id string) error {
	return config.DB.Delete(&models.Channel{}, "id = ?", id).Error
}
