package utils

import (
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func InitLogger() {
	// Configure zerolog for clean output
	zerolog.TimeFieldFormat = time.RFC3339
	log.Logger = log.Output(zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: "15:04:05",
		NoColor:    false,
	})

	// Set log level
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
}

func LogInfo(message string, fields ...interface{}) {
	if len(fields) > 0 {
		log.Info().Fields(fields).Msg(message)
	} else {
		log.Info().Msg(message)
	}
}

func LogError(message string, err error, fields ...interface{}) {
	if len(fields) > 0 {
		log.Error().Err(err).Fields(fields).Msg(message)
	} else {
		log.Error().Err(err).Msg(message)
	}
}

func LogWarn(message string, fields ...interface{}) {
	if len(fields) > 0 {
		log.Warn().Fields(fields).Msg(message)
	} else {
		log.Warn().Msg(message)
	}
}