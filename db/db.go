package db

import (
	"flag"
	"github.com/jackc/pgx"
	"github.com/sirupsen/logrus"
)

var DatabaseHost = flag.String("pghost", "192.168.88.26", "PG hostname")
var DatabaseUser = flag.String("pguser", "postgres", "PG username")
var DatabasePassword = flag.String("pgpassword", "toor", "PG password")
var DatabaseDatabase = "madast"
var Port uint16 = 5433

func Connect() (conn *pgx.Conn, err error) {
	conn, err = pgx.Connect(pgx.ConnConfig{
		Host:     *DatabaseHost,
		Port:     Port,
		User:     *DatabaseUser,
		Password: *DatabasePassword,
		Database: DatabaseDatabase,
	})
	if err != nil {
		logrus.Fatal("Unable to connection to database: %v\n", err)
	}
	return
}