package main

import (
	"flag"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/just1689/entity-sync/es"
	"github.com/sirupsen/logrus"
	"github.com/team142/snaily/api"
	"github.com/team142/snaily/db"
	"github.com/team142/snaily/email"
	"github.com/team142/snaily/model"
	"github.com/team142/snaily/sync"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

var addr = flag.String("address", ":8080", "")
var addrToProxy = flag.String("proxy", "http://localhost:4200", "The url of the angular app to reverse proxy")
var container = flag.Bool("container", false, "The url of the angular app to reverse proxy")

var DatabaseHost = flag.String("pghost", "localhost", "PG hostname")
var DatabaseUser = flag.String("pguser", "snaily", "PG username")
var DatabasePassword = flag.String("pgpassword", "snaily", "PG password")
var DatabaseDatabase = "madast"
var Port = flag.Uint64("pgport", 5000, "PG port")
var nsqAddr = flag.String("nsqd", "nsqd:4150", "The address of the nsq daemon")

func main() {
	flag.Parse()

	setMailClientConfig()
	setDBDefaultConfig()
	setETCDConfig()

	router := mux.NewRouter()

	config := es.Config{
		NSQAddr: *nsqAddr,
		Mux:     router,
	}
	entitySync := es.Setup(config)
	sync.SetupSync(entitySync)

	//Handles all API calls
	router.PathPrefix("/api").HandlerFunc(api.HandleIncoming)

	//Handles everything else
	if *container {
		//Serve from web folder
		router.PathPrefix("/").HandlerFunc(staticFileServer)
	} else {
		//When running locally - reverse proxy to node js server
		router.PathPrefix("/").HandlerFunc(buildHomeRouter())
	}

	//The server
	http.Handle("/", router)
	log.Fatal(http.ListenAndServe(*addr, nil))
}

func setETCDConfig() {

}

func setMailClientConfig() {
	email.GlobalMailConfig = model.OutgoingMailConfig{
		SMTPHost: "smtp.migadu.com",
		Port:     587,
		Username: "notify@dependmap.com",
		Password: os.Getenv("MAIL_PASSWORD"),
		UseTLS:   true,
	}

}

func setDBDefaultConfig() {
	db.DefaultConfig.User = *DatabaseUser
	db.DefaultConfig.Password = *DatabasePassword
	db.DefaultConfig.Host = *DatabaseHost
	db.DefaultConfig.Port = uint16(*Port)
	db.DefaultConfig.Database = DatabaseDatabase

	logrus.Infoln(
		db.DefaultConfig.User, "@",
		db.DefaultConfig.Host, ":",
		db.DefaultConfig.Port, "/",
		db.DefaultConfig.Database,
	)
}

func staticFileServer(w http.ResponseWriter, r *http.Request) {
	name := fmt.Sprint("/snaily-web", r.URL.Path)

	if name == "/snaily-web/" {
		w.Header().Add("Cache-Control", "no-store")
		name = "/snaily-web/index.html"
	}

	if f, err := os.Stat(name); err == nil && !f.IsDir() {
		logrus.Println("For: ", r.URL.Path, ", Serving: ", name)
		http.ServeFile(w, r, name)
		return
	}

	if !strings.Contains(name, ".") {
		logrus.Println("For: ", r.URL.Path, ", Serving: ", "/snaily-web/index.html")
		w.Header().Add("Cache-Control", "no-store")
		http.ServeFile(w, r, "/snaily-web/index.html")
		return
	}

	logrus.Println("For: ", r.URL.Path, ", NOT FOUND")
	http.NotFound(w, r)

}

func buildHomeRouter() func(w http.ResponseWriter, r *http.Request) {
	u, _ := url.Parse(*addrToProxy)
	rp := httputil.NewSingleHostReverseProxy(u)
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Cache-Control", "no-cache")
		rp.ServeHTTP(w, r)
	}
}
