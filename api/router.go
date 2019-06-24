package api

import (
	"fmt"
	"github.com/sirupsen/logrus"
	"github.com/team142/snaily/controller"
	"net/http"
)

func HandleIncoming(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Write([]byte(""))
		return
	}

	auth, ID := checkKey(r)

	/*
		#
			NO AUTH
		#
	*/
	if r.URL.Path == "/api/register/v1" {
		handleRegisterUser(w, r)
		return
	}
	if r.URL.Path == "/api/login/v1" {
		handleLoginUser(w, r)
		return
	}

	if !auth {
		logrus.Println("Access denied with key...")
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte(""))
		return
	}

	/*
		#
			AUTH REQUIRED
		#
	*/
	if r.URL.Path == "/api/new-item/v1" {
		handleCreateItem(w, r, ID)
		return
	}

	if r.URL.Path == "/api/get-item/v1" {
		handleGetItem(w, r, ID)
		return
	}

	if r.URL.Path == "/api/my-items/v1" {
		handleGetMyItems(w, r, ID)
		return
	}

	if r.URL.Path == "/api/close-item/v1" {
		handleCloseItem(w, r, ID)
		return
	}

	msg := fmt.Sprint("Could not find route for ", r.URL.Path)
	logrus.Println(msg)
	w.Write([]byte(msg))
}

func checkKey(r *http.Request) (authenticated bool, ID string) {
	key := r.Header.Get("key")
	if key == "" {
		return
	}
	return controller.SessionValid(key)

}
