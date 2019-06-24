package controller

import (
	"github.com/sirupsen/logrus"
	"github.com/team142/snaily/db"
	"time"
)

func SessionValid(key string) (found bool, ID string) {
	ID = db.DefaultETCDClient.Getter(key)
	found = ID != ""
	return
}

func SetSession(key, ID string, duration time.Duration) {
	err := db.DefaultETCDClient.Setter(key, ID, duration)
	if err != nil {
		logrus.Errorln(err)
		//TODO: SHOULD WE RETURN THIS???
	}
	return
}
