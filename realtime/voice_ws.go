package realtime

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

var Rooms = make(map[string]map[*websocket.Conn]bool)
var mu sync.Mutex

func VoiceWebSocket(c *websocket.Conn) {
	roomID := c.Params("channelId")
	log.Println("New WebSocket connection attempt to channel:", roomID)

	mu.Lock()
	if Rooms[roomID] == nil {
		Rooms[roomID] = make(map[*websocket.Conn]bool)
	}
	Rooms[roomID][c] = true
	mu.Unlock()

	log.Println("WebSocket connected to channel:", roomID)

	defer func() {
		mu.Lock()
		delete(Rooms[roomID], c)
		mu.Unlock()
		log.Println("WebSocket disconnected from channel:", roomID)
		c.Close()
	}()

	for {
		var msg map[string]interface{}
		if err := c.ReadJSON(&msg); err != nil {
			log.Println("ReadJSON error:", err)
			break
		}

		log.Println("Broadcasting message:", msg)

		mu.Lock()
		for peer := range Rooms[roomID] {
			if peer != c {
				if err := peer.WriteJSON(msg); err != nil {
					log.Println("WriteJSON error:", err)
				}
			}
		}
		mu.Unlock()
	}
}
