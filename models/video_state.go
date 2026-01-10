package models

import "time"

// VideoState tracks a user's state in a video channel
type VideoState struct {
	ID        string `gorm:"primaryKey"`
	UserID    string
	ProfileID string
	ServerID  string
	ChannelID string

	Muted     bool
	CameraOn  bool
	JoinedAt  time.Time
}
