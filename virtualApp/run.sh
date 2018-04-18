#!/bin/bash

kill -9 `ps -a|grep node|awk '{print $1}'`

node ./assets/server.js&

echo ===========================================
echo \    虚拟app服务已启动
echo \    可通过http://127.0.0.1:9600访问管理面板
echo ===========================================