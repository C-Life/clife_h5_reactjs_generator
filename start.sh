#!/bin/bash

# 启动工程开发环境批处理
# 可传参，也可不传，不传参时，将会引导选择
# 传参示例：start.sh  beauty/myDevDir v1.0.1 yes
# 分别表示：开发目录、版本号、自动刷新

title=het
base_dir=other

# 选择产品线流程
echo =============== 默认文件夹 other ====================

# 选择设备流程
if [ -n "$1" ];then
    base_dir=$1
else
    echo ================ 设备 =====================
    for f in `ls ./$base_dir | grep -v common`;do
        let i=i+1
        echo \  $i $f
    done
    echo ===========================================
    while :
    do
        dev_path=_THIS_IS_A_NONEXISTENT_DIRECTORY_
        read -p "请选择设备: " device
        let j=0
        for f in `ls ./$base_dir | grep -v common`;do
            let j=j+1
            if [ "$j" == "$device" ];then
                dev_path=$f
                break
            fi
        done
        if [ "$dev_path" != "_THIS_IS_A_NONEXISTENT_DIRECTORY_" ];then
            break
        else
            echo 选择有误！
            continue
        fi
    done
    base_dir=$base_dir/$dev_path/
fi

echo ====== $base_dir

# 输入版本号流程
if [ -z "$version" ] && [ -n "$2" ];then
    version=$2
else
    read -p "请输入版本号（默认v1.0.1）: " version
fi
if [ -z "$version" ];then
    version=v1.0.1
fi
clear

# 设置自动刷新
autorefresh=$3
if [ -z "$autorefresh" ];then
    autorefresh=yes
fi

# 选择工作模式流程
while :
do
    clear
    echo =============== 工作模式 ==================
    echo \   1. 运行开发环境（执行自动构建）
    echo \   2. 预发布本项目（打zip包）
    echo \   3. 初始化项目（新建或维护他人项目时，可用此功能初始化）
    echo ===========================================
    read -p "请选择工作模式（默认1）: " work
    if [ -z "$work" ];then
        work=1
    fi

    if [ "$work" == "1" ];then
        echo 开始自动构建...
        bash ./runVirtualApp.sh
    elif [ "$work" == "2" ];then
        echo 开始预发布项目...
    elif [ "$work" == "3" ];then
        echo 开始初始化项目...
    else
        continue
    fi
    gulp --work $work --path $base_dir --ver $version --autorefresh $autorefresh --title "$title"
    read -p "按回车键继续..." enterKey
done