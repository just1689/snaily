package db

import (
	"context"
	"fmt"
	"github.com/sirupsen/logrus"
	"go.etcd.io/etcd/clientv3"
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

	cfg := clientv3.Config{
		Endpoints:   []string{url},
		DialTimeout: 5 * time.Second,
	}
	cli, err := clientv3.New(cfg)
	if err != nil {
		log.Fatal(err)
	}

	getter = func(key string) string {
		ctx, _ := context.WithTimeout(context.Background(), time.Hour)
		key = prefixKey(key)
		resp, err := cli.Get(ctx, key)
		if err != nil {
			logrus.Errorln(err)
			return ""
		}

		for _, v := range resp.Kvs {
			return string(v.Value)
		}
		return ""
	}

	setter = func(key, value string, TTL time.Duration) (err error) {
		ctx, cancel := context.WithTimeout(context.Background(), time.Hour)
		key = prefixKey(key)
		logrus.Println("Going to set", key, value, "for ttl", TTL)
		_, err = cli.Put(ctx, key, value, nil)
		if err != nil {
			logrus.Errorln(err)
		}
		cancel()
		return
	}

	//Test
	//_ = setter("1+1", "2", time.Hour)
	//s := getter("1+1")
	//if s != "2" {
	//	logrus.Fatalln("Not 2")
	//}

	return

}

func prefixKey(key string) string {
	return fmt.Sprint("/", key)
}
