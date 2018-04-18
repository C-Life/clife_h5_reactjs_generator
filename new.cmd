@echo off
setlocal enabledelayedexpansion
set titl=HeT - 新建项目
title %titl%

rem 新建项目批处理

rem 选择产品线流程
echo =============== HET OTHER ====================
set base_dir=other
title %titl%

:input_name
set /p projName=请输入产品名称（用做目录名）: 
if "%projName%"=="" goto input_name
if exist %base_dir%/%projName% (
    echo err: 产品名称冲突，请重新输入
    goto input_name
)
echo 正在创建产品 %projName% ...

md "%base_dir%/%projName%/"
xcopy /s "_public/_template" "%base_dir%/%projName%"

rem 生成start快捷方式
set linkFile="%base_dir%/%projName%/start.cmd"
echo @echo off>>"%linkFile%"
echo rem   %base_dir%>>"%linkFile%"
echo rem ============== 项目配置 ===================>>"%linkFile%
echo rem 版本号>>"%linkFile%"
echo set version=v1.0.1>>"%linkFile%"
echo rem 自动刷新浏览器（yes/no）>>"%linkFile%"
echo set autorefresh=yes>>"%linkFile%"
echo rem ===========================================>>"%linkFile%"
echo set pa=%%cd%%>>"%linkFile%"
echo cd ../../>>"%linkFile%"
echo :redo>>"%linkFile%"
echo cmd /c start.cmd %%pa%% %%version%% %%autorefresh%%>>"%linkFile%"
echo pause>>"%linkFile%"
echo goto redo>>"%linkFile%"

rem 生成虚拟app配置文件
echo {"host":"200.200.200.50","ready":{},"configData":{},"runningData":[{"hello":"\u5F53\u4F60\u770B\u5230\u8FD9\u6761\u4FE1\u606F\uFF0C\u8868\u660E\u79CD\u5B50\u9879\u76EE\u5DF2\u6210\u529F\u8FD0\u884C\uFF01"}]}>"virtualApp\apps\%projName%.json"

echo ===========================================
echo   %projName% 创建成功！
echo   路径：%base_dir%/%projName%/
echo   注意：开始开发前，请先初始化项目（工作模式选3）
echo ===========================================
pause