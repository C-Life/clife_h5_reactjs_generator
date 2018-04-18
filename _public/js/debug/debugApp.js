// app注入对象
var DebugApp = function(){
    var logs; // log记录集
    var successCallbackId = null;
    var errorCallbackId = null;
    var cursor = 0; // 游标
    var stepMode = true; // 是否步进模式
    var autoTimer = 0; // 自动模式计时器
    var consoleDom; // 控制台DOM
    var waitSendData = false; // 是否正在等待发送数据
    var $this = this;

    // 接收web传送的验证信息
    $this.config = function(option){
        hasConfigured = true;
    };
    // 接收web端传送的数据
    $this.send = function(data, sucCallbackId, errCallbackId) {
        var diff = {};
        var isDiff = false;
        var html = '';
        var sendData = JSON.parse(data);
        var normalDataString = parseLog(logs[cursor-1]).data; // 取出应该发送的数据，以做对比
        var normalData = JSON.parse(normalDataString);
        var sndPanel = consoleDom.querySelector('.snd');
        successCallbackId = sucCallbackId;
        errorCallbackId = errCallbackId;
        for (var k in sendData) {
            if (sendData[k]!=normalData[k]) {
                diff[k] = sendData[k];
                isDiff = true;
            }
        }
        if (isDiff) {
            consoleDom.querySelector('.pnl').style.display = 'none';
            sndPanel.style.display = 'block';
            sndPanel.innerHTML = '<b>retry</b><b>ignore</b>';
            html += '<p>原始数据：' + normalDataString + '</p>';
            html += '<p style="color:red">差异数据：' + JSON.stringify(diff) + '</p>';
            barrage('数据有差异', html);
        } else {
            consoleDom.querySelector('.pnl').style.display = 'block';
            sndPanel.style.display = 'none';
            barrage('已方send', normalDataString);
            !stepMode && next();
        }
    };

    getLogFile().then(function(data){
        logs = data.split('\n');
        if (logs[logs.length-1].length < 3) {
            logs.pop(); // 消除最后一条空数据
        }
        !stepMode && next();
    });

    // 开始执行
    function next(){
        var log, log2;
        if (cursor>=logs.length) {
            barrage('FINISH', '已经是最后一条');
            return;
        }
        log = parseLog(logs[cursor]);
        cursor++;
        switch (log.type) {
            case 'rdy': // APP调用ready
                webInterface.ready(log.data);
                barrage('ready', log.data, log.time);
            break;
            case 'rcv': // APP调用repaint
                webInterface.repaint(log.data);
                barrage('repaint', log.data, log.time);
            break;
            case 'snd': // WEB调用send
                guideSend(log);
                return;
            break;
            case 'suc': // APP调用success
                webInterface.success(log.data, successCallbackId);
                barrage('success', log.data, log.time);
            break;
            case 'fai': // APP调用error
                webInterface.success(log.data, errorCallbackId);
                barrage('error', log.data, log.time);
            break;
        }
        if (!stepMode && cursor < logs.length) {
            log2 = parseLog(logs[cursor]);
            autoTimer = setTimeout(next, log2.time - log.time);
        }
    }

    /**
     * 引导WEB发送数据
     * @param    {object}   log 一条log记录
     */
    function guideSend(log){
        var sndPanel = consoleDom.querySelector('.snd');
        sndPanel.style.display = 'block';
        consoleDom.querySelector('.pnl').style.display = 'none';
        sndPanel.innerHTML = '<b>doit</b>';
        barrage('请尝试提交以下数据', log.data);
    }

    /**
     * 弹幕
     * @param    {string}   title 标题
     * @param    {string}   msg   信息
     * @param    {integer}  time  时间戳
     */
    function barrage(title, msg, time){
        var html = '<p style="margin-bottom:5px">['+title+'] '+(time ? new Date(time).toLocaleString() : '')+'</p>';
            html += '<p>'+msg+'</p>';
        consoleDom.style.display = 'block';
        consoleDom.querySelector('.barrage').innerHTML = html;
    }

    /**
     * 解析log记录
     * @param    {string}   txt log字符串
     * @return   {object}       返回解析后的log对象
     */
    function parseLog(txt){
        var mat = txt.match(/^\[(\w+)\]\[(.+?)\] (.+)\r?$/);
        if (!mat) throw new Error('log解析失败: ' + txt);
        var dm = mat[2].match(/^(\d+\-\d+\-\d+ \d+:\d+:\d+) (\d+)$/);
        var timestamp = new Date(dm[1]).getTime() + parseInt(dm[2]);
        return {
            type : mat[1],
            time : timestamp,
            data : mat[3]
        };
    }

    /**
     * 获取log文件，返回Promise对象
     * @return   {Promise}   返回Promise对象
     */
    function getLogFile(){
        var mat = location.search.match(/logfile\=(.+?.log)/);
        var file = '';
        if (!mat) {
            alert('logfile配置有误，请核对！\n\neg.\n?logfile=xxx.log');
            throw new Error('logfile配置有误，请核对！');
        }
        file = '../log/' + mat[1];
        return fetch(file).then(function(response){
            if (!response.ok) {
                alert('logfile文件加载失败！请检查是否存在该文件！');
                throw new Error('logfile文件加载失败！');
            }
            return response.text();
        });
    }

    // 植入操作面板
    window.addEventListener('DOMContentLoaded', function(){
        consoleDom = document.createElement('div');
        var style = document.createElement('style');
        consoleDom.id = 'DEBUGGER';
        consoleDom.innerHTML = '<div class=pnl><b>step</b><span class=ctl><b>prev</b><b>next</b></div>';
        consoleDom.innerHTML += '<div class=snd><b>doit</b></div>';
        consoleDom.innerHTML += '<div class=barrage></div>';
        style.innerText = '#DEBUGGER{position:fixed;z-index:999999;top:0;width:100%;padding:10px 0;background:rgba(0,0,0,.6);font-size:12px;color:#fff;}';
        style.innerText += '#DEBUGGER b{display:inline-block;border:1px solid #ccc;border-radius:5px;padding:5px;margin:0 10px;}';
        style.innerText += '#DEBUGGER b:active{background:rgba(255,255,255,.5);}';
        style.innerText += '#DEBUGGER>.barrage{margin-top:5px;padding-top:5px;border-top:1px solid #ccc;word-break:break-all;}';
        style.innerText += '#DEBUGGER>.snd{display:none;}';
        document.head.appendChild(style);
        document.body.appendChild(consoleDom);
        // 流程控制
        consoleDom.onclick = function(e) {
            var tgt = e.target;
            switch(tgt.innerText){
                case 'auto': // 自动切步进
                    stepMode = true;
                    tgt.innerText = 'step';
                    consoleDom.querySelector('.ctl').innerHTML='<b>prev</b><b>next</b>';
                break;
                case 'step': // 步进切自动
                    stepMode = false;
                    tgt.innerText = 'auto';
                    consoleDom.querySelector('.ctl').innerHTML='<b>pause</b>';
                    next();
                break;
                case 'pause': // 继续切暂停
                    clearTimeout(autoTimer);
                    tgt.innerText = 'resume';
                break;
                case 'resume': // 暂停切继续
                    next();
                    tgt.innerText = 'pause';
                break;
                case 'prev': // 上一条log
                    cursor = cursor > 2 ? cursor-2 : 0;
                    next();
                break;
                case 'next': // 下一条log
                    next();
                break;
                case 'doit': // 去发送数据
                case 'retry': // 重试发送数据
                    consoleDom.style.display = 'none';
                break;
                case 'ignore': // 忽略数据差异
                    consoleDom.querySelector('.snd').style.display = 'none';
                    consoleDom.querySelector('.pnl').style.display = 'block';
                    !stepMode && next();
                break;
            }
        };
    });

};

var bindJavaScript = new DebugApp();
