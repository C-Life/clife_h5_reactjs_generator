@echo off
setlocal enabledelayedexpansion
set titl=HeT
title %titl%

rem 启动工程开发环境批处理
rem 可传参，也可不传，不传参时，将会引导选择
rem 传参示例：start.cmd  beauty/myDevDir v1.0.1 yes
rem 分别表示：开发目录、版本号、自动刷新

rem 选择产品线流程
echo =============== HET OTHER ====================
set base_dir=other
title %titl%

rem 选择设备流程
echo ================ 设备 =====================
set /a i=0
for /d %%d in (%base_dir%/*) do if not %%d==common (
    set /a i=i+1
    echo    !i! %%d
)
echo ===========================================
if not "%1"=="" (
    set base_dir=%1/
    set titl=%titl% @ %1
    goto select_device2
)
:select_device
set /p device=请选择设备: 
if "%device%"=="" goto :select_device
set dev_path=null
set /a i=0
for /d %%d in (%base_dir%/*) do if not %%d==common (
    set /a i=i+1
    if !i!==%device% (
        set dev_path=%%d
        set titl=%titl% / %%d
    )
)
if "%dev_path%"=="null" (
    echo 选择有误！
    goto :select_device
)
set base_dir=%base_dir%/%dev_path%/
:select_device2
title %titl%

rem 输入版本号流程
if not "%2"=="" (
    set version=%2
) else (
    set /p version=请输入版本号（默认v1.0.1）: 
)
if "%version%"=="" set version=v1.0.1
set titl=%titl% - version: %version%
title %titl%
cls

:select_work
rem 选择工作模式流程
echo =============== 工作模式 ==================
echo    1. 运行开发环境（执行自动构建）
echo    2. 预发布本项目（打zip包）
echo    3. 初始化项目（新建或维护他人项目时，可用此功能初始化）
echo ===========================================
set /p work=请选择工作模式（默认1）: 
if "%work%"=="" set work=1

rem 设置自动刷新
set autorefresh=%3
if "%autorefresh%"=="" set autorefresh=yes

rem 执行工作流
if %work%==1 (
    echo 开始自动构建...
    start runVirtualApp
) else if %work%==2 (
    echo 开始预发布项目...
) else if %work%==3 (
    echo 开始初始化项目...
    rem set pa=%cd%
    rem cd %base_dir%
    rem TortoiseProc /command:add /path:"./"
    rem TortoiseProc /command:ignore /path:"static*vm"
    rem cd %pa%
) 
gulp --work %work% --path %base_dir% --ver %version% --autorefresh %autorefresh% --title "%titl%"

:END
rem 无条件跳转至选择工作模式流程
goto select_work

pause