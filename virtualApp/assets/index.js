var server = 'http://'+ location.hostname +':' + __serverPort + '/';
var appName = '';
// 加载app配置
$('#load-app').on('click', function(){
    var appPackName = $('[name=appPackName]').val();
    ajax(server + 'getAppData?app=' + appPackName, '', 'GET', function(data){
        var d = JSON.parse(data);
        var runData = d.runningData;
        appName = appPackName;
        $('[name=host]').val(d.host);
        $('[name=accessToken]').val(d.accessToken);
        $('[name=readydata]').val(JSON.stringify(d.ready));
        $('[name=confdata]').val(JSON.stringify(d.configData));
        // 处理运行数据
        $('#rundata-wrap').empty();
        for (var i=0;i<runData.length;i++) {
            $('#rundata-wrap').append(createRunDataDom(JSON.stringify(runData[i])));
        }
    }, function(){
        alert(appPackName + ' 不存在，请核对！');
    });
});
// 提交基本配置
$('#submit-base').on('click', function(){
    var data = '';
    var val;
    if (!appName) {
        alert('没有找到配置文件，请先建立配置文件');
        return;
    }
    data += 'host=' + $('[name=host]').val();
    data += '&accessToken=' + $('[name=accessToken]').val();
    val = $('[name=readydata]').val();
    if (!isJson(val)) {
        alert('非法的JSON格式');
        return;
    }
    data += '&ready=' + encodeURIComponent(val);
    ajax(server + 'updateAppConfig?app=' + appName, data, 'POST', function(data){
        // console.log(data);
    });
});
// 提交控制数据
$('#submit-conf').on('click', function(){
    var data = '';
    var val;
    if (!appName) {
        alert('没有找到配置文件，请先建立配置文件');
        return;
    }
    val = $('[name=confdata]').val();
    if (!isJson(val)) {
        alert('非法的JSON格式');
        return;
    }
    data += 'configData=' + encodeURIComponent(val);
    ajax(server + 'updateAppConfig?app=' + appName, data, 'POST', function(data){
        // console.log(data);
    });
});
// 提交运行数据
$('#submit-runn').on('click', function(){
    var data = '[';
    var valid = true;
    if (!appName) {
        alert('没有找到配置文件，请先建立配置文件');
        return;
    }
    $('[name=runndata]').each(function(){
        var val = $(this).val();
        if (!isJson(val) && val.length!='') {
            valid = false;
            return false;
        }
        data += val ? val + ',' : '';
    });
    if (!valid) {
        alert('非法的JSON格式');
        return;
    }
    data = data.replace(/\,$/, '');
    data += ']';
    // data += 'configData=' + $('[name=confdata]').val();
    ajax(server + 'updateAppConfig?app=' + appName, 'runningData=' + encodeURIComponent(data), 'POST', function(data){
        // console.log(data);
    });
});
// 添加运行数据
$('#addrunn').on('click', function(){
    $('#rundata-wrap').append(createRunDataDom('{\n    \n}'));
});

// 提交实时数据
$('#submit-realdata').on('click', function(){
    var data = $('#realdata').val();
    if (!isJson(data)) {
        alert('非法的JSON格式');
        return;
    }
    ajax(server + 'realData', 'data=' + encodeURIComponent(data), 'POST', function(data){
        // console.log(data);
    });
});

// 标签切换
$('#nav-wrap').on('click', 'a', function(e){
    var me = $(e.target);
    me.addClass('active').siblings().removeClass('active');
    $('#'+me.attr('for')).addClass('active').siblings('section').removeClass('active');
});

// 调节控制台高度
(function(){
    var moving = false;
    var movingBox = $('footer');
    var startY = 0;
    var startH = 0;
    $('#dragarea').on('mousedown', function(e){
        startY = e.pageY;
        startH = movingBox.height();
        moving = true;
    });
    $('html,body').on('mousemove', function(e){
        var y = startY - e.pageY;
        if (moving) {
            movingBox.height(startH + y);
        }
    });
    $('html,body').on('mouseup', function(e){
        moving = false;
    });
})();

function createRunDataDom(data){
    return '<p><textarea name="runndata" style="width:600px;height:100px;">'+data+'</textarea></p>';
}

function waitLog(){
    var logWrap = document.getElementById('log-wrap');
    ajax(server + 'waitLog', '', 'GET', function(data){
        var pre = document.createElement('pre');
        pre.innerText = data;
        logWrap.appendChild(pre);
        logWrap.scrollTop = logWrap.scrollHeight;
        waitLog();
    }, waitLog);
}
waitLog();

// 验证json有效性
function isJson(data){
    try{
        JSON.parse(data);
        return true;
    } catch(err) {
        return false;
    }
}

/**
 * ajax请求函数
 * @param    {string}   url         请求地址
 * @param    {string}   data        发送的数据，格式为：name=张三&age=21
 * @param    {string}   type        请求类型，GET / POST
 * @param    {function} sucCallback 成功时的回调函数
 * @param    {function} errCallback 失败时的回调函数
 */
function ajax(url, data, type, sucCallback, errCallback){
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