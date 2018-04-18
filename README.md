# clife_h5_reactjs_generator

C-Life H5 快速开发的脚手架
# app-h5开发指导文档_V2（试行）

## 目录
<!-- MarkdownTOC depth=4 autolink=true bracket=round -->

- [开发环境](#开发环境)
    - [开发环境搭建](#开发环境搭建)
- [项目开发](#项目开发)
    - [规范及约定](#规范及约定)
        - [目录规范](#目录规范)
        - [文件规范](#文件规范)
        - [注释规范](#注释规范)
    - [项目构建及发布](#项目构建及发布)
        - [新建项目](#新建项目)
        - [初始化项目](#初始化项目)
        - [实时构建](#实时构建)
        - [项目发布](#项目发布)
- [测试调试](#测试调试)
    - [虚拟app环境](#虚拟app环境)
        - [虚拟app服务（推荐）](#虚拟app服务（推荐）)
        - [虚拟脚本](#虚拟脚本)
    - [联调](#联调)
        - [Fiddler](#fiddler)
        - [weinre](#weinre)

<!-- /MarkdownTOC -->


****************

<span id="开发环境"></span>
## 开发环境
基于业务逻辑考虑，同时又兼顾统一维护和管理，该项目目前约定使用react系列做为基础开发框架。构建工具采用gulp。

<span id="开发环境搭建"></span>
### 开发环境搭建
* node.js安装
可以去[node.js官网](https://nodejs.org/en/download/){:target="_blank"}下载安装包进行安装。
安装完成后，在安装目录下找到node_modules/npm/.npmrc文件并打开，添加以下语句：

        registry = https://registry.npm.taobao.org
或执行以下命令：

        npm config set registry https://registry.npm.taobao.org 
***注：苹果、Linux系统可能需要额外安装  `nodejs-legacy`***

* npm使用
安装了node.js以后，即可使用npm包管理器安装node.js模块。以下仅介绍两个常用的命令，更多命令请自行百度，本文不再赘述。
安装模块：
        
        npm install <name> [-g] [--save-dev]
删除模块：

        npm uninstall <name> [-g]

* gulp安装
打开命令提示符，执行`npm install gulp -g`

* 初始化开发环境
在根目录下执行`npm install`即可自动安装构建工具（gulp模块）, 需要用到的模块已在package.json配置好。也可根据自己需要自行安装其它模块。（注：如安装报错，可尝试直接再次执行`npm install`）

* 苹果、Linux系统安装注意事项
可能出现脚本没有执行权限的情况，可执行以下命令进行授权

        for d in new.sh start.sh runVirtualApp.sh virtualApp/run.sh; do chmod 0777 $d; done

***************

<span id="项目开发"></span>
## 项目开发

<span id="规范及约定"></span>
### 规范及约定
为提高工作效率，减少重复造轮子的工作，本项目推崇组件化开发模式。另外，因项目参与人员过多，为便于维护管理，现做约定如下：

<span id="目录规范"></span>
#### 目录规范
##### I. 公共目录
各产品线均设有一个公共目录，用于存放本产品线相关的公共文件

1. ** /[LINE_NAME]/common/src ** 目录为公共文件目录，常用公共文件存放于此

2. ** /[LINE_NAME]/common/src/lib ** 目录为库目录

##### II. 项目目录
项目目录位于** /[LINE_NAME]/[PROJ_NAME] **。此处约定源文件目录规范（src目录），项目结构后面会提到

1. ** src/css ** 目录为样式表存放目录，所有的样式表均存放于此目录

2. ** src/js ** 目录为js、jsx、es6文件存放目录。

3. ** src/js/lib ** 目录为库文件目录，各种第三方库可存放于此目录（通用性较高的第三方库应放入公共目录）

<span id="文件规范"></span>
#### 文件规范
1. 项目文件命名统一采用驼峰式，如：lightBeauty.html。

2. **js入口文件必须命名为appXXX.{js,es6,jsx}，以便构建工具自动识别。示例：appMain.es6。**

3. css文件可用@import导入公共文件，随后构建工具将自动合并，以减少请求。

4. react文件，一般采用jsx后缀；es6语法的文件，采用es6后缀，便于维护。

5. 组件开发时，尽可能考虑其复用性。对于通用性较高的组件，可提取为公共组件，并提升至** common/src/lib **目录。

6. 图片文件，因不需要编译构建，可直接存放于** static/img **目录进行调用。

<span id="注释规范"></span>
#### 注释规范
1. 函数或方法的注释采用如下格式，用sublime的可以尝试DocBlockr插件。
```java
/**
* [foo description]
* @param  {[type]} arg1 [description]
* @param  {[type]} arg2 [description]
* @return {[type]}      [description]
*/
function foo(arg1, arg2){
}
```

2. react组件的注释采用如下格式：
```java
/**
* [MyComponent description]
* @prop {[type]}  prop1  [description]
* @prop {[type]}  prop2  [description]
*/
var MyComponent = React.createClass({
});
```

<span id="项目构建及发布"></span>
### 项目构建及发布

<span id="新建项目"></span>
#### 新建项目
根目录下运行`new.cmd`(苹果、Linux运行`./new.sh`)，根据引导将从种子项目生成新项目。目录结构大致如下：

    + page      // app设备html文件
    + src       // 工程源文件，代码编写在此目录进行
        + css
        + js
    + static    // 构建完成的工程文件，请勿直接编辑
        + css
        + img
        + js
    + vm        // 用于模拟app环境的虚拟器

<span id="初始化项目"></span>
#### 初始化项目
从种子项目生成的新项目，由于还没进行构建，无法立即运行，所以需要进行一次初始化。
初始化项目，可运行根目录的`start.cmd`(苹果、Linux运行`./start.sh`)，按提示选中本项目，最后“**工作模式**”选**3**。
**注：**
**1. 为了减少操作，项目目录下也设有一个快捷start.cmd(start.sh)文件；**
**2. 项目目录下的快捷start.cmd(start.sh)文件可进行项目版本号配置；**

<span id="实时构建"></span>
#### 实时构建
为便于开发调试，本工程已经配置好实时构建命令。
`start.cmd`(苹果、Linux运行`./start.sh`)工作模式选1，即可开启实时构建，并将自动在浏览器打开该项目。
此时，所有在/src目录下的修改，都将自动构建并同步到/static目录。同时，浏览器将自动刷新。

<span id="项目发布"></span>
#### 项目发布
##### 项目文件发布
1. 打包方式
`start.cmd`(苹果、Linux运行`./start.sh`)工作模式选2。打包后，将于 /app-h5-zip/[LINE_NAME] 目录生成 [PROJ_NAME]-[version].tar.gz文件。
2. 发布方式
待定

**********

<span id="测试调试"></span>
## 测试调试
<span id="虚拟app环境"></span>
### 虚拟app环境
#### 虚拟app服务（推荐）
可运行`runVirtualApp.cmd`(苹果、Linux运行`./runVirtualApp.sh`)启动虚拟app服务，请勿关闭该窗口。当从start.cmd(start.sh)启动自动构建时，也会自动启动该服务。
可通过[http://127.0.0.1:9600](http://127.0.0.1:9600){:target="_blank"}打开控制台。 输入新建项目时的“app名称”，点“加载配置”即可进行配置。
也可以在此控制台的“实时数据”面板进行实时数据推送模拟。

#### 虚拟脚本
如不习惯虚拟app服务，也可自行创建虚拟app脚本进行调试。虚拟脚本约定存放于/vm目录。
由技术框架可知，app方将会往前端注入config、send两个方法以供前端调用。因此，虚拟脚本范例如下：
```java
var APP = function(){
    this.config = function(options) {
        setTimeout(function(){ // app延时模拟
            webInterface.ready();
            webInterface.repaint({type:0, data:{key1:value1, updateFlag:0}});
            webInterface.repaint({type:1, data:{key1:value1}});
        }, 100);
    };
    this.send = function(data, successCallbackId, errorCallbackId) {
        setTimeout(function(){ // app延时模拟
            webInterface.success("success!", successCallbackId);
            // webInterface.error("error!", errorCallbackId);
        }, 100);
    };
};
var bindJavaScript = new APP();
```

其中，`repaint({type:0, data:{}})` 是模拟app往前端推送配置数据；`repaint({type:1, data:{}})` 则是模拟运行数据。
配置数据一般只有一种，而运行数据可能会有多种。
如在运行时希望推数据进行测试，可在控制台运行 `webInterface.repaint({})` 方法进行推送。

<span id="联调"></span>
### 联调
项目交付app实施后，可能还会存在许多意料外的bug。这些bug多数是由于数据与预期不一致造成。因此，我们需要一些手段来在真实app环境下进行调试。以下将介绍两款辅助工具。

#### Fiddler
目前有Fiddler2和Fiddler4两种版本，Fiddler2依赖的是.net2.0，Fiddler4则是.net4.0。可根据自己电脑上的.net框架进行选择安装。 [Fiddler官方网址](http://www.telerik.com/download/fiddler)
Fiddler本身其实是一款网络代理软件，当你启动它的时候，你电脑上的所有网络请求都将由它代理。所以，我们让它能够代理我们的手机网络，这样就能在电脑上进行远程调试了。
步骤如下：

1. 电脑端，启动Fiddler，依次选择 Tools > Fiddler Options.. > Connections ，然后勾选“Allow romote computers to connect”。如需要更改端口号，在“Fiddler listens on port:” 填写。最后点击OK即可。

2. 打开命令提示符，执行`ipconfig`确定本机局域网IP地址。如：192.168.1.100

3. 手机端，连入本地局域网wifi网络，进入当前连入wifi的设置页，代理模式选择手动，主机名填第2步查到的192.168.1.100，端口填8888（或你第1步修改的端口号）。

至此，已可以在手机上操作APP，然后在Fiddler里查看数据交互情况了。关于Fiddler的详细使用方法，请自行百度，本文不再赘述。


#### weinre
使用Fiddler可以帮我们追踪到app是否有从服务器取到数据，监听的是app到server的数据，却不能让我们监听到app到web的数据。对于我方开发人员来说，app到web的数据流是否正确，才是最重要的。因此，我们要借助另一款工具：weinre。

1. 执行`npm install weinre -g`安装weinre

2. 执行`weinre --boundHost -all-`开启weinre

3. 打开命令提示符，执行`ipconfig`确定本机局域网IP地址。如：192.168.1.100

4. 浏览器打开[192.168.1.100:8080](http://127.0.0.1:8080){:target="_blank"}

5. 在“Target Script”栏找到“Example”里的代码，并复制到项目html文件中

        <script src="http://192.168.1.100:8080/target/target-script-min.js#anonymous"></script>

6. 确保你的项目可以在局域网内通过`http://192.168.1.100/yourproject`访问到（可让同事帮忙测试）。如不能访问，可关闭防火墙并开启guest账户再试。

7. 将网址`http://192.168.1.100/yourproject`提供给app方打测试包

8. 在weinre浏览器界面“Access Points”栏找到“debug client user interface:”并点击，将会进入调试面板。切换到console选项卡，进入控制台

至此，你可以在本地编辑你的项目，在需要的地方打断点，然后在app里进行操作。weinre将提供输出你所需要的调试信息的能力。甚至，在“Elements”标签下，你还可以“遥控”界面。

