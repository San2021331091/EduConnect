package realtime

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

var VideoRooms = make(map[string]map[*websocket.Conn]bool)
var p sync.Mutex

func VideoWebSocket(c *websocket.Conn) {
	channelID := c.Params("channelId")
	userID := c.Params("userId")

	log.Println("New WebSocket connection attempt to channel:", channelID, "user:", userID)

	// Add connection to room
	p.Lock()
	if VideoRooms[channelID] == nil {
		VideoRooms[channelID] = make(map[*websocket.Conn]bool)
	}
	VideoRooms[channelID][c] = true
	p.Unlock()

	// Broadcast join message
	p.Lock()
	for peer := range VideoRooms[channelID] {
		if peer != c {
			peer.WriteJSON(map[string]interface{}{
				"type": "join",
				"from": userID,
			})
		}
	}
	p.Unlock()

	defer func() {
		// Remove connection
		p.Lock()
		delete(VideoRooms[channelID], c)
		p.Unlock()

		// Broadcast leave message
		p.Lock()
		for peer := range VideoRooms[channelID] {
			if peer != c {
				peer.WriteJSON(map[string]interface{}{
					"type": "leave",
					"from": userID,
				})
			}
		}
		p.Unlock()

		log.Println("WebSocket disconnected from channel:", channelID, "user:", userID)
		c.Close()
	}()

	// Handle messages (offer/answer/ice)
	for {
		var msg map[string]interface{}
		if err := c.ReadJSON(&msg); err != nil {
			log.Println("ReadJSON error:", err)
			break
		}

		// Forward message to target peer if specified
		if to, ok := msg["to"].(string); ok && to != "" {
			p.Lock()
			for peer := range VideoRooms[channelID] {
				if peer != c {
					peer.WriteJSON(msg)
				}
			}
			p.Unlock()
		} else {
			// Broadcast to all other participants
			p.Lock()
			for peer := range VideoRooms[channelID] {
				if peer != c {
					if err := peer.WriteJSON(msg); err != nil {
						log.Println("WriteJSON error:", err)
					}
				}
			}
			p.Unlock()
		}
	}
}
