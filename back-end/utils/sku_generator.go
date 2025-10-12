package utils

import (
	"math/rand"
	"time"
)

func init() {
    rand.Seed(time.Now().UnixNano())
}

func GenerateSKU() string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    datePart := time.Now().Format("02012006")

    const randLen = 5
    buf := make([]byte, randLen)
    for i := range buf {
        buf[i] = chars[rand.Intn(len(chars))]
    }

    return "ITSKU-DS-" + datePart + "-" + string(buf)
}