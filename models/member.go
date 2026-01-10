package models

import "time"

type MemberRole string

const (
	ADMIN     MemberRole = "ADMIN"
	MODERATOR MemberRole = "MODERATOR"
	GUEST     MemberRole = "GUEST"
)

type Member struct {
	ID        string     `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Role      MemberRole `json:"role" gorm:"default:'GUEST'"`

	ProfileID string `json:"profileID"`
	UserID    string `json:"userID" gorm:"type:uuid"`
	ServerID  string `json:"serverID" gorm:"type:uuid"`

	Profile *Profile `json:"profile,omitempty" gorm:"foreignKey:ProfileID;references:UserID;constraint:OnDelete:CASCADE"`
	Server  *Server  `json:"-" gorm:"foreignKey:ServerID;references:ID;constraint:OnDelete:CASCADE"`

	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

