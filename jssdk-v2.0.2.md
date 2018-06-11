## H5框架jssdk文档

### 目录

1. 配置接口 [het.config](#bar1)
2. SDK准备就绪接口 [het.ready](#bar2)
3. 页面准备就绪接口 [het.domReady](#bar3)
4. 接收运行数据接口 [het.updateRunData](#bar4)
5. 接收控制数据接口 [het.updateControlData](#bar5)
6. 接收故障数据接口 [het.updateErrorData](#bar6)
7. 接收配置数据接口 [het.updateConfigData](#bar7)
8. 接收离线在线状态接口 [het.updateOnOffState](#bar8)
9. 发送数据接口 [het.send](#bar9)
10. 数据对比接口 [het.diff](#bar10)
11. 设置页面标题接口 [het.setTitle](#bar11)
12. 计算updateFlag值 [het.calcUpdateFlag](#bar12)
13. 计算16进制updateFlag值 [het.hexUpFlag](#bar13)
14. 调用系统toast [het.toast](#bar14)
15. 代理get请求 [het.get](#bar15)
16. 代理post请求 [het.post](#bar16)
17. 配置app [het.nativeConfig](#bar17)
18. 获取app数据 [het.nativeData](#bar18)
19. 获取APPJSBridge版本号 [het.getAPPJSBridgeVersion](#bar19)
20. 资源加载失败提示 [het.onLoadH5Failed](#bar20)
21. 显示消息提示 [het.showToast](#bar21)
22. 隐藏消息提示 [het.hideToast](#bar22)
23. 显示提示框 [het.showAlertView](#bar23)
24. 显示操作菜单 [het.showActionSheet](#bar24)
25. 设置导航栏标题与颜色 [het.setNavigationBarTitle](#bar25)
26. 设置导航栏按钮 [het.setNavigationBarButton](#bar26)
27. 获取网络类型 [het.getNetworkType](#bar27)
28. 监听网络状态变化 [het.onNetworkStatusChange](#bar28)
29. 监听蓝牙连接状态变更 [het.listenBLEState](#bar29)
30. 监听蓝牙状态数据变更 [het.listenBLEStateData](#bar30)
31. 监听蓝牙电量状态变更 [het.listenBLEPower](#bar31)
32. 获取蓝牙设备的实时数据 [het.getBLERealTimeData](#bar32)
33. 获取蓝牙设备的历史数据 [het.getBLEHistoryData](#bar33)
34. 获取蓝牙设备的时间 [het.getBLETimeData](#bar34)
35. 设置蓝牙设备的时间 [het.setBLETimeData](#bar35)
36. 获取APP语言 [het.getAPPLanguage](#bar36)
37. 获取设备信息 [het.getDeviceInfo](#bar37)
38. 获取设备MCU升级 [het.getDeviceMcuUpgrade](#bar38)
39. 分享接口 [het.showShareActionSheet](#bar39)

### 功能接口

要使用该SDK，首先需要引入SDK文件[hetsdk.js](_public/js/core/hetsdk.js)。引入该文件后，在js全局环境中将自动添加het对象，该对象相应的方法见下列接口说明。

<span id="bar1"></span>

#### 1. 配置接口

##### 方法调用说明

    het.config(SETTINGS)
    // settings格式为json对象，json字段详见参数说明

##### 参数说明

|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:--------:|:-----------
| callbackExpire |    否    | integer  | 回调函数过期时间，缺省为30s
| torporTime     |    否    | integer  | 迟钝时间，缺省为5s，当调用[send](#bar5)方法之后，忽略所有在该时间内接收到的数据请求
| webDataMap     |    否    | json     | web <-> app数据映射表，缺省不映射
| useUpdateFlag  |    否    | boolean  | （该参数将弃用，为兼容旧版，暂时保留）是否自动添加updateFlag标记，缺省不添加
| updateFlagMap  |    否    | json     | 配置updateFlag标记映射表，用于自动计算updateFlag，缺省为空
| onceConfigData |    否    | boolean  | 仅接受一次控制数据，缺省为true
| renderConfigData |  否    | boolean  | 是否渲染控制数据，缺省不渲染
| filter         |    否    | object   | 过滤器，可对单个字段设置过滤规则。有纯数字和函数两种。函数形式提供type、data两个参数。
| debugMode      |    否    | string   | 开启debug，缺省不开启. 目前可选模式为print
| company        |    否    | string   | 公司标识，缺省为het
| line           |    否    | string   | 产品线表示，缺省为common

*注：以上列出的为SDK内置参数，只在本地处理，不会被发送至app。可根据app需要添加参数。如参数未在以上列表中，将被发送至app*

##### 返回结果

因该方法将调用app接口，返回内容由app决定。目前暂时无用。

##### 范例

```javascript
het.config({
    debugMode : 'print', // 打印调试数据
    webDataMap : {
        'mode'  : 'devMode',  // 将原始devMode映射为mode
        'power' : 'refgSwitch' // 将原始的refgSwitch映射为power
    },
    updateFlagMap : {
        'mode' : 9, // 模式的标记位为9
        'power' : 14 // 开关的标记位为14
    },
    renderConfigData : true, // 开启控制数据渲染，以便filter能取到控制数据
    filter : {
        'mode' : 0, // 仅取控制数据
        'color' : 1, // 仅取运行数据
        'power' : function(type, data) {
            if (type===1 && data.mode===2) {
                return false; // 运行数据，且模式为2时，舍弃power
            } else {
                return true; // 其它情形均不过滤power
            }
        }
    }

});
```

***********************************************************************

<span id="bar2"></span>
#### 2. SDK准备就绪接口

##### 方法调用说明
    het.ready(CALLBACK)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:--------:|:-----------
| callback       |    是    | function | 回调函数，当sdk准备就绪时，将会执行该方法登记的回调函数。*注意，该回调只会被调用一次。*

##### 返回结果
该方法用于登记回调函数，不返回任何结果

***********************************************************************

<span id="bar3"></span>
#### 3. 页面准备就绪接口
该接口用于在页面准备就绪时调用，其实就是DOMContentLoaded的封装，也可根据需要自己实现
##### 方法调用说明
    het.domReady(CALLBACK)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:--------:|:-----------
| callback       |    是    | function | 回调函数，当WEB页面准备就绪时，将会执行该方法登记的回调函数。*注意，该回调只会被调用一次。*

##### 返回结果
该方法用于登记回调函数，不返回任何结果

***********************************************************************

<span id="bar4"></span>
#### 4. 登记用于接收运行数据的函数

##### 方法调用说明
    het.updateRundata(CALLBACK)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callback       |    是    | function | 回调函数，当接收到运行数据时，将执行该方法登记的回调函数。

##### 返回结果
该方法用于登记回调函数，不返回任何结果

##### 范例
```javascript
het.updateRundata(function(data){
    console.log('运行数据', data);
});
```

***********************************************************************

<span id="bar5"></span>
#### 5. 登记用于接收控制数据的函数

##### 方法调用说明
    het.updateControlData(CALLBACK)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callback       |    是    | function | 回调函数，当接收到控制数据时，将执行该方法登记的回调函数。

##### 返回结果
该方法用于登记回调函数，不返回任何结果

##### 范例
```javascript
het.updateControlData(function(data){
    console.log('控制数据', data);
});
```

***********************************************************************

<span id="bar6"></span>
#### 6. 登记用于接收故障数据的函数

##### 方法调用说明
    het.updateErrorData(CALLBACK)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callback       |    是    | function | 回调函数，当接收到故障数据时，将执行该方法登记的回调函数。

##### 返回结果
该方法用于登记回调函数，不返回任何结果

##### 范例
```javascript
het.updateErrorData(function(data){
    console.log('故障数据', data);
});
```

***********************************************************************

<span id="bar7"></span>
#### 7. 登记用于接收配置数据的函数

##### 方法调用说明
    het.updateConfigData(CALLBACK)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callback       |    是    | function | 回调函数，当接收到配置数据时，将执行该方法登记的回调函数。

##### 返回结果
该方法用于登记回调函数，不返回任何结果

##### 范例
```javascript
het.updateConfigData(function(data){
    console.log('配置数据', data);
});
```

***********************************************************************

<span id="bar8"></span>
#### 8. 登记用于接收在线离线状态的函数

##### 方法调用说明
    het.updateOnOffState(CALLBACK)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callback       |    是    | function | 回调函数，当接收到在线离线状态时，将执行该方法登记的回调函数。

##### 返回结果
该方法用于登记回调函数，不返回任何结果

##### 范例
```javascript
het.updateOnOffState(function(data){
    console.log('在线离线状态', data);
    console.log(data.onlineStatus);
});
```

***********************************************************************

<span id="bar9"></span>
#### 9. 发送数据接口

##### 方法调用说明
    het.send(data, sucCallback, errCallback)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data           |    是    | json     | 将发送给app的数据，一般是完整的控制数据
| sucCallback    |    否    | function | app方数据处理成功时将调用该方法
| errCallback    |    否    | function | app方数据处理失败时将调用该方法

##### 返回结果
因该方法将调用app接口，返回内容由app决定。目前暂时无用。

***********************************************************************

<span id="bar10"></span>
#### 10. 与控制数据进行对比
将当前数据与控制数据进行对比，可用于决断是否需要发送控制数据

##### 方法调用说明
    het.diff(jsonData)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| jsonData       |    是    | json     | 将该数据与控制数据对比，接收格式形为：`{key1:value1,key2:value2,...}`

##### 返回结果
返回与控制数据有差异的部分，格式与接收格式相同

##### 范例
```java
var data = {
    mode : 1,
    power : 1
};
var diffData = het.diff(data); // 检出与控制数据差异部分
if (Object.keys(diffData).length>0) {
    het.send(data); // 有差异，需要提交
} else {
    het.toast('没有数据需要提交！');
}
```

***********************************************************************

<span id="bar11"></span>
#### 11. 设置页面标题接口
该方法用于设置页面标题，同时将标题发送给app，以供app进行标题更新。
##### 方法调用说明
    het.setTitle(title)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| title          |    是    | string   | 将设置的标题

##### 返回结果
不返回任何结果。

***********************************************************************

<span id="bar12"></span>
#### 12. 计算updateFlag值
该方法用于计算updateFlag值，以供提交控制数据
##### 方法调用说明
    het.calcUpdateFlag(offset)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| offset         |    是    | Integer  | 偏移量（二进制位，从1开始）

##### 返回结果
返回十进制计算结果

***********************************************************************

<span id="bar13"></span>
#### 13. 计算16进制updateFlag值
该方法用于计算16进制的updateFlag值，以供提交控制数据
##### 方法调用说明
    het.hexUpFlag(index, length, upLength, originUpFlag)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| index          |    是    | Integer  | 索引值（二进制位，从0开始）
| length         |    否    | Integer  | 该功能占字节长度，默认为1
| upLength       |    否    | Integer  | 整个updateFlag所占字节长度，默认为4
| originUpFlag   |    否    | string   | 原始updateFlag（十六进制字符串），默认为"00"

##### 返回结果
返回十六进制字符串

***********************************************************************

<span id="bar14"></span>
#### 14. 调用系统toast
该方法用于调用系统toast，以便app方统一toast风格
##### 方法调用说明
    het.toast(msg)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| msg            |    是    | string   | 将要弹出的提示信息

##### 返回结果
因该方法将调用app接口，返回内容由app决定。目前暂时无用。

***********************************************************************

<span id="bar15"></span>
#### 15. 代理get请求
该方法用于让app代理get方式的http请求
##### 方法调用说明
    het.get(url, data, sucCallback, errCallback)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| url            |    是    | string   | 请求地址。如用相对地址，必须“/” 开头（如：/v1/app/get）
| data           |    否    | json     | 发送数据。形式为：`{"name": "张三", "age": 21, ...}`
| sucCallback    |    否    | function | 成功时的回调函数（状态码为200或304时，才认定为成功）
| errCallback    |    否    | function | 失败时的回调函数
| needSign       |    否    | integer  | 接口是否需要签名（相对地址时有效）

##### 返回结果
不返回任何结果。

***********************************************************************

<span id="bar16"></span>
#### 16. 代理post请求
该方法用于让app代理post方式的http请求
##### 方法调用说明
    het.post(url, data, sucCallback, errCallback)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| url            |    是    | string   | 请求地址。如用相对地址，必须“/” 开头（如：/v1/app/get）
| data           |    否    | json     | 发送数据。形式为：`{"name": "张三", "age": 21, ...}`
| sucCallback    |    否    | function | 成功时的回调函数（状态码为200或304时，才认定为成功）
| errCallback    |    否    | function | 失败时的回调函数
| needSign       |    否    | integer  | 接口是否需要签名（相对地址时有效）

##### 返回结果
不返回任何结果。

***********************************************************************

<span id="bar17"></span>
#### 17. 配置app
该方法用于配置app或调用app方法
##### 方法调用说明
    het.nativeConfig(options, sucCallback, errCallback)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| options        |    是    | json     | 配置项(json对象)
| sucCallback    |    否    | function | 成功时的回调函数
| errCallback    |    否    | function | 失败时的回调函数

##### options说明
    options:{
        method : "title", //必填,标识触发app方法名
        line : "common", //选填，产品线开发有独立功能时填写
        company : "het", //选填，外包公司开发有独立功能时填写
        data : {
            msg : "test", //选填，按与app商定字段填写
            ok : function(){}, //选填，按与app商定字段填写
            cancel : function(){} //选填，按与app商定字段填写
        } //data必填,传递给app的数据
    }
##### 返回结果
不返回任何结果。

***********************************************************************

<span id="bar18"></span>
#### 18. 获取app数据
该方法用于主动获取app端的数据
##### 方法调用说明
    het.nativeData(options, sucCallback, errCallback)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| options        |    是    | json     | 配置项(json对象)
| sucCallback    |    否    | function | 成功时的回调函数
| errCallback    |    否    | function | 失败时的回调函数

##### options说明
    options:{
        method : "title", //必填,标识触发app方法名
        line : "common", //选填，产品线开发有独立功能时填写
        company : "het" //选填，外包公司开发有独立功能时填写
    }

##### 返回结果
不返回任何结果。

***********************************************************************

<span id="bar19"></span>

#### 19. 获取APPJSBridge版本号

该方法用于主动获取JSBridge的版本号

##### 方法调用说明

    het.getAPPJSBridgeVersion(jssdkversion,completeCallbackId)

##### 参数说明

|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| jssdkversion   |    是    | string   | JSSDK的版本号
| completeCallbackId |    是    | string   | 回调函数回传APPJSBridge版本号

##### 返回结果

该方法会调用APP方法，APP会通过回调函数回传APPJSBridge版本号

##### APP回传参数说明

|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| jssdkversion   |    是    | string   | JSSDK的版本号

***********************************************************************

<span id="bar20"></span>

#### 20. 资源加载失败提示

该方法用于H5资源加载失败时的提示

##### 方法调用说明

    het.onLoadH5Failed(errCode,errMsg)

##### 参数说明

|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| errCode   |    是    | string   | 失败的错误码
| errMsg    |    是    | string   | 失败的错误信息

##### 错误码说明

|    errCode    | errMsg
|---------------|:--------------
|    10100    |    公共包资源加载失败
|    10101    |    SDK版本不匹配
|    10102    |    资源加载失败
|    10103    |    代码运行错误
|    10104    |    页面渲染异常
|    10105    |    页面无响应

##### 返回结果
不返回任何结果。

***********************************************************************

<span id="bar21"></span>
#### 21. 显示消息提示
该方法用于显示APP的消息提示
##### 方法调用说明
    het.showToast(title, icon, image, duration, mask, successCallbackId, failCallbackId, completeCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| title    |    是    | string   | 提示的内容
| icon     |    否    | string   | 图标，有效值 "success", "loading"
| image  |    否    | string   | 自定义图标的路径，image 的优先级高于 icon
| duration   |    是    | string   | 提示的延迟时间，单位毫秒，默认：1500
| mask    |    是    | string  | 是否显示透明蒙层，防止触摸穿透，默认：0
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数
| completeCallbackId |    是    | function  | 接口调用结束的回调函数（调用成功、失败都会执行）

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    否    | string   | 提示框相关信息

***********************************************************************

<span id="bar22"></span>
#### 22. 隐藏消息提示
该方法用于隐藏APP的消息提示
##### 方法调用说明
    het.hideToast()

##### 返回结果
不返回任何结果。

***********************************************************************

<span id="bar23"></span>
#### 23. 显示提示框
该方法用于打开APP的提示框
##### 方法调用说明
    het.showAlertView(title, content, showCancel, cancelText, cancelColor, confirmText, confirmColor, successCallbackId, failCallbackId, completeCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| title    |    是    | string   | 提示的标题
| content  |    是   | string  | 提示的内容
| showCancel  |    否    | Boolean   | 是否显示取消按钮，默认为 true
| cancelText  |    否    | string   | 取消按钮的文字，默认为"取消"，最多 4 个字符
| cancelColor |    是    | HexColor  | 取消按钮的文字颜色，默认为"#000000"
| confirmText  |    是   | string   | 确定按钮的文字，默认为"确定"，最多 4 个字符
| confirmColor |    是    | HexColor  | 确定按钮的文字颜色，默认为"#3CC51F"
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数
| completeCallbackId |    是    | function  | 接口调用结束的回调函数（调用成功、失败都会执行）

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    否    | string   | 提示框相关信息

##### 范例

        data:{
            confirm:true, //boolean 用户点击确认的标识
            cancel:true, //boolean 用户点击取消的标识
            error:xxx, //string 发生错误的信息
        }

***********************************************************************

<span id="bar24"></span>
#### 24. 显示操作菜单
该方法用于显示APP的操作菜单
##### 方法调用说明
    het.showActionSheet(title, itemList, itemColor, successCallbackId, failCallbackId, completeCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| title    |    是    | string   | 提示的标题
| itemList  |    是   | string array | 按钮的文字数组，数组长度最大为6个
| itemColor  |    是    | HexColor   | 按钮的文字颜色，默认为"#000000"
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数
| completeCallbackId |    是    | function  | 接口调用结束的回调函数（调用成功、失败都会执行）

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    否    | string   | 菜单栏相关信息

##### 范例

        data:{
            index:0, //nber 用户点击菜单选项的标识,0代表上面第一个（按钮顺序是从上到下）
            error:xxx, //string 发生错误的信息
        }

***********************************************************************

<span id="bar25"></span>
#### 25. 设置导航栏标题与颜色
该方法用于设置APP导航栏的标题和颜色
##### 方法调用说明
    het.setNavigationBarTitle(title, frontColor, backgroundColor, image,successCallbackId, failCallbackId, completeCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| title    |    是    | string   | 页面标题
| frontColor  |    是   | string | 前景颜色值，包括按钮、标题、状态栏的颜色,有效值为十六进制颜色
| backgroundColor |    是    | string | 背景颜色值，有效值为十六进制颜色
| image |    是    | string | 图片路径
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数
| completeCallbackId |    是    | function  | 接口调用结束的回调函数（调用成功、失败都会执行）

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    否    | json   | 导航栏相关信息

***********************************************************************

<span id="bar26"></span>
#### 26. 设置导航栏按钮
该方法用于设置APP导航栏按钮
##### 方法调用说明
    het.setNavigationBarButton(colorStyle, rightButtonHide, successCallbackId, failCallbackId, completeCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| colorStyle    |    是    | string  | 左右导航栏的样式颜色，0代表白色样式，1代表黑色样式
| rightButtonHide  |    是    | string  | 导航栏右边按钮是否隐藏，0代表不隐藏，1代表隐藏
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数
| completeCallbackId |    是    | function   | 接口调用结束的回调函数（调用成功、失败都会执行）

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    否    | json   | 导航栏相关信息

##### 范例

        data:{
            index:0, //number 用户点击按钮选项的标识
            error:xxx, //string 发生错误的信息
        }

***********************************************************************

<span id="bar27"></span>
#### 27. 获取网络类型
该方法用于获取APP的网络类型
##### 方法调用说明
    het.getNetworkType(successCallbackId, failCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    否    | json   | 网络状态相关信息

##### 范例

        data:{
            isConnected:0(无网络)|1(有网络), //number 网络状态
            networkType:wifi|2g|3g|4g|none|unknown, //string 网络类型
            error:xxx, //string 发生错误的信息
        }

***********************************************************************

<span id="bar28"></span>
#### 28. 监听网络状态变化
该方法用于监听APP的网络状态变化
##### 方法调用说明
    het.onNetworkStatusChange(successCallbackId, failCallbackId)

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    否    | json   | 网络状态相关信息

##### 范例

        data:{
            isConnected:0(无网络)|1(有网络), //number 网络状态
            networkType:wifi|2g|3g|4g|none|unknown, //string 网络类型
            error:xxx, //string 发生错误的信息
        }

***********************************************************************

<span id="bar29"></span>
#### 29. 监听蓝牙连接状态变更
该方法用于监听APP蓝牙设备连接状态的变更
##### 方法调用说明
    het.listenBLEState(callbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callbackId |   是    | function | 接口调用成功的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| bleStateType   |    是   | string   | 蓝牙设备的连接状态

bleStateType 有效值：

|值	|说明|
|-----|:----:|
|0	|未连接|
|1	|连接中|
|2	|连接上|
|3	|连接失败|
|4	|设备端主动断开了连接|
|5|	设备重连中|
|6|连接上并且认证成功|

***********************************************************************

<span id="bar30"></span>
#### 30. 监听蓝牙状态数据变更
该方法用于监听APP蓝牙设备数据状态的变更
##### 方法调用说明
    het.listenBLEStateData(callbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callbackId |   是    | function | 接口调用成功的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    是   | json   | 蓝牙设备的状态数据

***********************************************************************

<span id="bar31"></span>
#### 31. 监听蓝牙电量状态变更
该方法用于监听APP蓝牙电量状态的变更
##### 方法调用说明
    het.listenBLEPower(callbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callbackId |   是    | function | 接口调用成功的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| power   |    是   | string   | 蓝牙设备的电量

***********************************************************************

<span id="bar32"></span>
#### 32. 获取蓝牙设备的实时数据
该方法用于获取APP蓝牙设备的实时数据
##### 方法调用说明
    het.getBLERealTimeData(successCallbackId, failCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    是   | json   | 蓝牙设备的实时数据

***********************************************************************

<span id="bar33"></span>
#### 33. 获取蓝牙设备的历史数据
该方法用于获取APP蓝牙设备的历史数据
##### 方法调用说明
    het.getBLEHistoryData(successCallbackId, failCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    是   | json   | 蓝牙设备的历史数据

***********************************************************************

<span id="bar34"></span>
#### 34. 获取蓝牙设备的时间
该方法用于获取APP蓝牙设备的时间
##### 方法调用说明
    het.getBLETimeData(successCallbackId, failCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| timeType   |    是   | string   | 蓝牙设备的时间

timeType 有效值:

|值  |说明|
|-----|:----:|
|0  | 格林治时间|
|1  | 本地时间(如北京时间)|

***********************************************************************

<span id="bar35"></span>
#### 35. 设置蓝牙设备的时间
该方法用于设置APP蓝牙设备的时间
##### 方法调用说明
    het.setBLETimeData(successCallbackId, failCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| timeType   |    是   | string   | 蓝牙设备的时间

timeType 有效值:

|值	|说明|
|-----|:----:|
|0	| 格林治时间|
|1	| 本地时间(如北京时间)|

***********************************************************************

<span id="bar36"></span>
#### 36. 获取APP语言
该方法用于获取APP语言
##### 方法调用说明
    het.getAPPLanguage(callbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| callbackId |   是    | function | 接口调用成功的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| Language   |    是   | string   | 指定返回用户信息的语言，简体中文:zh\_CN,繁体中文:zh\_TW，英文:en 。默认为zh\_CN|

***********************************************************************

<span id="bar37"></span>
#### 37. 获取设备信息
该方法用于主动获取设备信息
##### 方法调用说明
    het.getDeviceInfo(successCallbackId, failCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    是   | json   | 设备信息

##### 范例

        data:{
            "deviceId": "501D275D6CD840F39FF862CC9AE3ABBA",
            "macAddress": "5c313e08fc09",
            "deviceBrandId": 1,
            "deviceBrandName": "和而泰",
            "deviceTypeId": 1,
            "deviceTypeName": "冰箱",
            "deviceSubtypeId": 1,
            "deviceSubtypeName": "冰箱",
            "deviceName": "CC13653",
            "roomId": 2,
            "roomName": "客厅",
            "bindTime": "2015-06-11 06:00:03",
            "onlineStatus":1,
            "share":1,
            "controlType":1,
            "userKey": "E4A6ECF07CC44D08D473FA42A580B78E",
            "authUserId":"501D275D6CD840F39FF862CC9AE3ABBA",
            "productId": 114,
            "productIcon": "http://200.200.200.50/v1/device/icon",
            "productName": "威力洗衣机",
            "productCode": "CC-1004",
            "moduleId": 3,
            "moduleName": "汉枫V7",
            "moduleType": 1,
            "radiocastName":null,
            "deviceCode": "0000C3AA00010105",
            "guideUrl"："http://200.200.200.50/XXX"
        }

***********************************************************************

<span id="bar38"></span>
#### 38. 获取设备MCU升级
该方法用于主动获取设备MCU升级
##### 方法调用说明
    het.getDeviceMcuUpgrade(successCallbackId, failCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    是   | json   | 设备升级信息

##### 范例

        data:{
            progress:0, //number 升级的进度
            error:xxx, //string 发生错误的信息
        }

***********************************************************************

<span id="bar39"></span>
#### 39. 分享接口
该方法用于打开APP的分享功能
##### 方法调用说明
    het.showShareActionSheet(title, content, images, url, successCallbackId, failCallbackId, completeCallbackId)

##### 参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| title    |    是    | string   | 提示的标题
| content  |    是   | string  | 提示的内容
| images  |    否    | string array   | 分享的图片数组
| url  |    否    | string   | 分享的链接url
| successCallbackId |   是    | function | 接口调用成功的回调函数
| failCallbackId |    是    | function   | 接口调用失败的回调函数
| completeCallbackId |    是    | function  | 接口调用结束的回调函数（调用成功、失败都会执行）

##### 返回结果
该方法会调用APP的接口，APP会在回调函数中回传结果。

##### APP回传参数说明
|    参数名称    | 是否必须 | 字段类型 |  参数说明
|:--------:|:--------:|:----------:|:-----------
| data   |    是   | json   | 分享的结果信息

##### 范例

        data:{
            sharePlatformType:0, //string 分享的平台
            error:xxx, //string 发生错误的信息
        }

##### sharePlatformType有效值

|值|说明|
|-----|:----:|
|SocialPlatformType_Sina               = 0 |新浪|
|SocialPlatformType_WechatSession      = 1|微信聊天|
|SocialPlatformType_WechatTimeLine     = 2|微信朋友圈|
|SocialPlatformType_WechatFavorite     = 3|微信收藏|
|SocialPlatformType_QQ                 = 4|QQ聊天页面|
|SocialPlatformType_Qzone              = 5|qq空间|
|SocialPlatformType_TencentWb          = 6|腾讯微博|
|SocialPlatformType_AlipaySession      = 7|支付宝聊天页面|