package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadLocalEnv(t *testing.T) {
	const key = "TRELLIS_TEST_FILE_VALUE"
	previous, existed := os.LookupEnv(key)
	os.Unsetenv(key)
	t.Cleanup(func() {
		if existed {
			os.Setenv(key, previous)
		} else {
			os.Unsetenv(key)
		}
	})
	path := filepath.Join(t.TempDir(), ".env.local")
	if err := os.WriteFile(path, []byte("# local configuration\n"+key+"=\"saved=value\"\n"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := loadLocalEnv(path); err != nil {
		t.Fatal(err)
	}
	if os.Getenv(key) != "saved=value" {
		t.Fatal("quoted file value was not loaded")
	}
	os.Setenv(key, "environment-value")
	if err := loadLocalEnv(path); err != nil {
		t.Fatal(err)
	}
	if os.Getenv(key) != "environment-value" {
		t.Fatal("environment override was replaced")
	}
	if err := loadLocalEnv(path + "-missing"); err != nil {
		t.Fatal(err)
	}
}
