package models

import "time"

type ChannelType string

const (
	TEXT  ChannelType = "TEXT"
	AUDIO ChannelType = "AUDIO"
	VIDEO ChannelType = "VIDEO"
)

type Channel struct {
	ID        string      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name      string      `json:"name"`
	Type      ChannelType `json:"type" gorm:"default:'TEXT'"`

	ProfileID string `json:"profileID"`
	ServerID  string `json:"serverID"`
	UserID    string `json:"userID" gorm:"type:text"`

	Profile *Profile `json:"profile,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Server  *Server  `json:"-" gorm:"constraint:OnDelete:CASCADE"` 

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}
