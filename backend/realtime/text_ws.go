package realtime

import (
	"encoding/json"
	"log"

	"fiber-backend/config"
	"fiber-backend/models"

	"github.com/gofiber/websocket/v2"
)

// ChatMessage is what the client sends
type ChatMessage struct {
	Type      string `json:"type"`      // "TEXT" | "FILE"
	Content   string `json:"content"`   // Text content
	FileURL   string `json:"fileUrl"`   // optional file URL
	FileName  string `json:"fileName"`  // optional file name
	SenderID  string `json:"senderID"`  // user sending
	ChannelID string `json:"channelID"` // the channel
}

// channelClients maps channelID -> connections
var channelClients = make(map[string]map[*websocket.Conn]bool)

func TextChannelWebSocket(c *websocket.Conn) {
	channelID := c.Params("channelId")

	if channelClients[channelID] == nil {
		channelClients[channelID] = make(map[*websocket.Conn]bool)
	}
	channelClients[channelID][c] = true

	defer func() {
		delete(channelClients[channelID], c)
		c.Close()
	}()

	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			log.Println("WebSocket read error:", err)
			break
		}

		var chatMsg ChatMessage
		if err := json.Unmarshal(msg, &chatMsg); err != nil {
			log.Println("JSON unmarshal error:", err)
			continue
		}

		// Map string type to MessageType
		var msgType models.MessageType
		switch chatMsg.Type {
		case "TEXT":
			msgType = models.TEXTMSG
		case "FILE":
			msgType = models.FILE
		default:
			msgType = models.TEXTMSG
		}

		// Save to DB
		message := models.Message{
			Content:   chatMsg.Content,
			FileURL:   chatMsg.FileURL,
			FileName:  chatMsg.FileName,
			Type:      msgType,
			SenderID:  chatMsg.SenderID,
			ChannelID: chatMsg.ChannelID,
		}

		if err := config.DB.Create(&message).Error; err != nil {
			log.Println("DB save error:", err)
			continue
		}

		// Broadcast to all clients in this channel
		for client := range channelClients[channelID] {
			if err := client.WriteJSON(message); err != nil {
				log.Println("WebSocket write error:", err)
			}
		}
	}
}
