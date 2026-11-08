package main

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"fmt"
)

func main() {
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		log.Fatal(err)
	}

	fmt.Println(hex.EncodeToString(key))


}