// app注入对象
var serverUrl = 'http://'+location.hostname+':' + __serverPort + '/';
var serverApp = location.href.match(/^.+\/([\w-]+)\/page\//)[1];
var bindJavaScript = new function(){
    this.config = function(option) {
        // 获取ready数据
        appTools.ajax(serverUrl + 'readyData?app=' + serverApp, '', 'GET', function(data){
            webInterface.ready(data);
            // 获取控制数据
            appTools.pushConfigData(appTools.pushRunningData);
            appTools.waitData(); // 启动实时数据监听
        });
    };
    this.send = function(data, successCallbackId, errorCallbackId) {
        // 延时模拟
        appTools.ajax(serverUrl + 'send?app=' + serverApp, 'data=' + data, 'POST', function(data){
            webInterface.success(data, successCallbackId);
        }, function(){
            webInterface.error('error - ' + new Date(), errorCallbackId);
        });
    };
    this.relProxyHttp = function(url, data, type, sucCallbackId, errCallbackId, needSign) {
        var datString = '';
        if (type==='GET' && url.indexOf('/')===0) { // 相对路径
            url += '?' + appTools.makeHttpData(data);
        } else {
            datString = appTools.makeHttpData(data);
        }
        appTools.ajax(serverUrl + 'proxy?app=' + serverApp, 'type='+type+'&url='+encodeURIComponent(url)+'&data=' + encodeURIComponent(datString), 'POST', function(data){
            webInterface.httpResponseSuccess(data, sucCallbackId);
        }, function(){
            webInterface.httpResponseError('error - ' + new Date(), errCallbackId);
        });
    };
    this.absProxyHttp = function(url, data, type, sucCallbackId, errCallbackId) {
        var datString = '';
        if (type==='GET' && url.indexOf('/')===0) { // 相对路径
            url += '?' + appTools.makeHttpData(data);
        } else {
            datString = appTools.makeHttpData(data);
        }
        appTools.ajax(serverUrl + 'proxy?app=' + serverApp, 'type='+type+'&url='+encodeURIComponent(url)+'&data=' + encodeURIComponent(datString), 'POST', function(data){
            webInterface.httpResponseSuccess(data, sucCallbackId);
        }, function(){
            webInterface.httpResponseError('error - ' + new Date(), errCallbackId);
        });
    };
};

var appTools = {
    makeHttpData : function(data) {
        var datString = '';
        try {
            d = JSON.parse(data);
            for (var i in d) {
                datString += '&' + i + '=' + d[i];
            }
            datString = datString.substring(1);
        } catch (err) {}
        return datString;
    },
    pushConfigData : function(cb) {
        appTools.ajax(serverUrl + 'configData?app=' + serverApp, '', 'GET', function(data){
            webInterface.repaint({type:0, data:JSON.parse(data)});
            if (typeof cb === 'function') {
                cb();
            }
        });
    },
    pushRunningData : function(cb) {
        appTools.ajax(serverUrl + 'runningData?app=' + serverApp, '', 'GET', function(data){
            var jsonData = JSON.parse(data);
            webInterface.repaint({type:1, data:jsonData.data});
            if (typeof cb === 'function') {
                cb();
            }
            if (typeof jsonData.last !== 'undefined' && !jsonData.last) {
                setTimeout(appTools.pushRunningData, 1000);
            }
        });
    },
    waitData : function(cb) {
        appTools.ajax(serverUrl + 'waitData', '', 'GET', function(data){
            webInterface.repaint({type:1, data:JSON.parse(data)});
            if (typeof cb === 'function') {
                cb();
            }
            appTools.waitData(cb);
        }, function(){
            appTools.waitData(cb);
            console.log('Err connect!');
        });
    },
    /**
     * ajax请求函数
     * @param    {string}   url         请求地址
     * @param    {string}   data        发送的数据，格式为：name=张三&age=21
     * @param    {string}   type        请求类型，GET / POST
     * @param    {function} sucCallback 成功时的回调函数
     * @param    {function} errCallback 失败时的回调函数
     */
    ajax : function(url, data, type, sucCallback, errCallback){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange=function(){
            if (xhr.readyState===4) {
                if (xhr.status===200 || xhr.status===304) {
                    if (typeof sucCallback === 'function') {
                        sucCallback(xhr.responseText);
                    }
                } else {
                    if (typeof errCallback === 'function') {
                        errCallback('Request failed! Status code: ' + xhr.status);
                    }
                }
            }
        };
        xhr.open(type, url, true);
        // xhr.withCredentials = true;
        if (type==='POST') {
            xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        }
        xhr.send(data);
    }
};
