package models

import (
	"time"
)

type MessageType string

const (
	TEXTMSG MessageType = "TEXT"
	FILE    MessageType = "FILE"
)

type Message struct {
	ID        string      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Content   string      `json:"content,omitempty"`  // Text message
	FileURL   string      `json:"fileUrl,omitempty"`  // Cloudinary URL
	FileName  string      `json:"fileName,omitempty"` // Original filename
	Type      MessageType `json:"type"`               // TEXT | FILE
	SenderID  string      `json:"senderId"`           
	ChannelID string      `json:"channelId"`          
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
}
