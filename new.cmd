@echo off
setlocal enabledelayedexpansion
set titl=HeT - �½���Ŀ
title %titl%

rem �½���Ŀ������

rem ѡ���Ʒ������
echo =============== HET OTHER ====================
set base_dir=other
title %titl%

:input_name
set /p projName=�������Ʒ���ƣ�����Ŀ¼����: 
if "%projName%"=="" goto input_name
if exist %base_dir%/%projName% (
    echo err: ��Ʒ���Ƴ�ͻ������������
    goto input_name
)
echo ���ڴ�����Ʒ %projName% ...

md "%base_dir%/%projName%/"
xcopy /s "_public/_template" "%base_dir%/%projName%"

rem ����start��ݷ�ʽ
set linkFile="%base_dir%/%projName%/start.cmd"
echo @echo off>>"%linkFile%"
echo rem   %base_dir%>>"%linkFile%"
echo rem ============== ��Ŀ���� ===================>>"%linkFile%
echo rem �汾��>>"%linkFile%"
echo set version=v1.0.1>>"%linkFile%"
echo rem �Զ�ˢ���������yes/no��>>"%linkFile%"
echo set autorefresh=yes>>"%linkFile%"
echo rem ===========================================>>"%linkFile%"
echo set pa=%%cd%%>>"%linkFile%"
echo cd ../../>>"%linkFile%"
echo :redo>>"%linkFile%"
echo cmd /c start.cmd %%pa%% %%version%% %%autorefresh%%>>"%linkFile%"
echo pause>>"%linkFile%"
echo goto redo>>"%linkFile%"

rem ��������app�����ļ�
echo {"host":"200.200.200.50","ready":{},"configData":{},"runningData":[{"hello":"\u5F53\u4F60\u770B\u5230\u8FD9\u6761\u4FE1\u606F\uFF0C\u8868\u660E\u79CD\u5B50\u9879\u76EE\u5DF2\u6210\u529F\u8FD0\u884C\uFF01"}]}>"virtualApp\apps\%projName%.json"

echo ===========================================
echo   %projName% �����ɹ���
echo   ·����%base_dir%/%projName%/
echo   ע�⣺��ʼ����ǰ�����ȳ�ʼ����Ŀ������ģʽѡ3��
echo ===========================================
pause