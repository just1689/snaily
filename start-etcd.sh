#!/usr/bin/env bash


docker service create --replicas 1 \
  --publish 2375:2379 \
  --publish 2380:2380 \
  --name etcd1 quay.io/coreos/etcd:latest \
  /usr/local/bin/etcd \
  --data-dir=/etcd-data --name etcd_node1 \
  --initial-advertise-peer-urls http://192.168.88.26:2380 --listen-peer-urls http://0.0.0.0:2380 \
  --advertise-client-urls http://0.0.0.0:2379 --listen-client-urls http://0.0.0.0:2379 \
  --initial-cluster etcd_node1=http://192.168.88.26:2380 \
  --initial-cluster-state new --initial-cluster-token etcd-cluster