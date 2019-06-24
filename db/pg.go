package db

import (
	"github.com/jackc/pgx"
	"github.com/sirupsen/logrus"
)

var DefaultConfigPg = Config{}

func ConnectPg(config Config) (conn *pgx.Conn, err error) {
	conn, err = pgx.Connect(pgx.ConnConfig{
		Host:     config.Host,
		Port:     config.Port,
		User:     config.User,
		Password: config.Password,
		Database: config.Database,
	})
	if err != nil {
		logrus.Fatal("Unable to connection to database: %v\n", err)
	}
	return
}
