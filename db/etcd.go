package db

import (
	"context"
	"go.etcd.io/etcd/client"
	"log"
	"time"
)

type Getter func(key string) string
type Setter func(key, value string, TTL time.Duration) error

var DefaultETCDClient EtcdClient

type EtcdClient struct {
	Getter Getter
	Setter Setter
}

func ConnectETCD(url string) (getter Getter, setter Setter, err error) {

	cfg := client.Config{
		Endpoints:               []string{url},
		Transport:               client.DefaultTransport,
		HeaderTimeoutPerRequest: time.Second,
	}
	c, err := client.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	kapi := client.NewKeysAPI(c)

	getter = func(key string) string {
		resp, err := kapi.Get(context.Background(), key, nil)
		if err != nil {
			log.Println(err)
			return ""
		}
		return resp.Node.Value
	}

	setter = func(key, value string, TTL time.Duration) (err error) {
		_, err = kapi.Set(context.Background(), key, value, &client.SetOptions{
			TTL: TTL,
		})
		if err != nil {
			log.Println(err)
		}
		return
	}

	return

}
