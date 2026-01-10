package models

import "time"

type Profile struct {
    UserID string `json:"userID" gorm:"type:uuid;primaryKey"`
    Name   string `json:"name"`
    ImgURL string `json:"imgURL" gorm:"type:text"`

    Email string `json:"email" gorm:"type:text;uniqueIndex"`

    Servers  []Server  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
    Members  []Member  `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
    Channels []Channel `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}

