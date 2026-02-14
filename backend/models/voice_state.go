package models

import "time"

type VoiceState struct {
	ID        string `gorm:"primaryKey"`
	UserID    string
	ProfileID string
	ServerID  string
	ChannelID string

	Muted     bool
	JoinedAt  time.Time
}
