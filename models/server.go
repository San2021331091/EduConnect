package models

import "time"

type Server struct {
	ID         string `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name       string `json:"name"`
	ImageURL   string `json:"imageURL" gorm:"type:text"`
	InviteCode string `json:"inviteCode" gorm:"type:text;uniqueIndex"`

	ProfileID string `json:"profileID" gorm:"type:uuid"`
	UserID    string `json:"userID" gorm:"type:uuid"`

	Profile  *Profile  `json:"profile,omitempty" gorm:"foreignKey:ProfileID;references:UserID;constraint:OnDelete:CASCADE"`
	Members  []Member  `json:"members,omitempty" gorm:"foreignKey:ServerID;references:ID;constraint:OnDelete:CASCADE"`
	Channels []Channel `json:"channels,omitempty" gorm:"foreignKey:ServerID;references:ID;constraint:OnDelete:CASCADE"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

