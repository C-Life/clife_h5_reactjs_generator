#!/bin/bash
# ============== 项目配置 ===================
# 版本号
version=v1.0.1
# 自动刷新浏览器（yes/no）
autorefresh=yes
# ==========================================
pa=$PWD/
cd ../../
./start.sh $pa $version $autorefresh
