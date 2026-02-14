package controllers

import (
	"fiber-backend/config"
	"fiber-backend/models"
)

// CreateMember inserts a new member
func CreateMember(member *models.Member) error {
	return config.DB.Create(member).Error
}


func GetMemberByID(id string) (models.Member, error) {
	var member models.Member
	err := config.DB.
		Preload("Profile").  // loads profile
		Preload("Server").   // loads server if needed
		First(&member, "id = ?", id).Error
	return member, err
}

// UpdateMember updates member data
func UpdateMember(member *models.Member) error {
	return config.DB.Save(member).Error
}

// DeleteMember removes a member
func DeleteMember(id string) error {
	return config.DB.Delete(&models.Member{}, "id = ?", id).Error
}
