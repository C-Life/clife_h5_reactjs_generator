@echo off
setlocal enabledelayedexpansion
title 虚拟app服务

echo 虚拟app服务已启动，请勿关闭该窗口！
echo 可通过http://127.0.0.1:9600访问管理面板

node assets/server.js