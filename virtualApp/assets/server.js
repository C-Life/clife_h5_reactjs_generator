var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var urlMode = require('url');
var path = 'assets';
var port = 9600; // 端口号

var realtimeData = null; // 实时数据
var realtimeDataTimer = -1; // 实时数据计时器
var logData = null; // log
var logTimer = -1; // log计时器
var runningDataIndex = 0; // 运行数据索引

http.createServer(function(req, res){
    var content = '';
    var url = urlMode.parse(req.url);
    switch (url.pathname) {
        default:
            var fo = getFile(path + url.pathname);
            res.writeHead(fo.code, {'Content-Type': fo.type});
            res.end(fo.data);
        break;
        case '/':
        case '/index.html':
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(fs.readFileSync(path + '/index.html'));
        break;
        case '/app.js':
            content = 'var __serverPort=' + port + ';\n';
            // content += 'var __serverApp=\'' + getUrlParam(url.search, 'app') +'\';\n';
            content += fs.readFileSync(path + '/virtualApp.js');
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.end(content);
        break;
        case '/index.js':
            content = 'var __serverPort=' + port + ';\n';
            content += fs.readFileSync(path + '/index.js');
            res.writeHead(200, {'Content-Type': 'application/javascript'});
            res.end(content);
        break;
        case '/readyData': // 获取ready数据
            content = getAppData(getUrlParam(url.search, 'app'), 'ready');
            if (content===null) {
                res.writeHead(404, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                res.end('{}');
            } else {
                res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                logData = 'Ready ' + content;
                res.end(content);
            }
        break;
        case '/configData': // 获取控制数据
            content = getAppData(getUrlParam(url.search, 'app'), 'configData');
            if (content===null) {
                res.writeHead(404, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                res.end('{}');
            } else {
                res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                logData = 'Conf ' + content;
                res.end(content);
            }
        break;
        case '/runningData': // 获取运行数据
            content = getAppData(getUrlParam(url.search, 'app'), 'runningData');
            if (content===null) {
                res.writeHead(404, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                res.end('{}');
            } else {
                var runningData = getSingleRunData(content);
                res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                logData = 'Runn ' + JSON.stringify(runningData.data);
                res.end(JSON.stringify(runningData));
            }
        break;
        case '/send': // 发送数据
            req.addListener('data',function(data){
                var d = querystring.parse(data.toString());
                logData = 'Recv ' + d.data;
            });
            res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
            res.end('{"code":0, "data":"OK"}');
        break;
        case '/realData': // 实时数据
            req.addListener('data',function(data){
                var d = querystring.parse(data.toString());
                logData = 'Real ' + d.data;
                realtimeData = d.data;
            });
            res.end('ok');
        break;
        case '/waitData': // 等待数据
            realtimeDataTimer = setInterval(realtimeDataPush, 10);
        break;
        case '/waitLog': // 等待数据
            logTimer = setInterval(logPush, 10);
        break;
        case '/proxy': // 代理http请求
            req.addListener('data',function(data){
                var d = querystring.parse(data.toString());
                if (d.type==='POST') {
                    logData = 'Http ' + d.type + ' ' + d.url + '\n              Data ' + d.data;
                } else {
                    logData = 'Http ' + d.type + ' ' + d.url;
                }
                d.host = getAppData(getUrlParam(url.search, 'app'), 'host');
                d.accessToken = getAppData(getUrlParam(url.search, 'app'), 'accessToken');
                proxy(res, d);
            });
        break;
        case '/getAppData': // 获取控制数据
            content = getAppData(getUrlParam(url.search, 'app'));
            if (content===null) {
                res.writeHead(404, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                res.end('{}');
            } else {
                res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
                res.end(content);
            }
        break;
        case '/updateAppConfig': // 保存配置文件
            content = getAppData(getUrlParam(url.search, 'app'));
            req.addListener('data',function(data){
                var d = querystring.parse(data.toString());
                var o = JSON.parse(content);
                try {
                    for (var i in d) {
                        o[i] = d2j(d[i]);
                    }
                    fs.writeFile('apps/' + getUrlParam(url.search, 'app') + '.json', JSON.stringify(o));
                } catch(err) {}
            });
            res.end('ok');
        break;
    }

    // 实时数据推送
    function realtimeDataPush(){
        if (realtimeData) {
            res.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
            res.end(realtimeData, function(){
                realtimeData = null;
                clearInterval(realtimeDataTimer);
            });
        }
    }

    // data转换为json
    function d2j(data){
        try {
            return JSON.parse(data);
        } catch(err) {
            return data;
        }
    }

    // log推送
    function logPush(){
        if (logData) {
            var d = new Date(),
                t = (d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ' ' + d.getMilliseconds()).replace(/(?=\b\d\b)|(?=\b\d\d$)/g, '0');
            res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
            res.end('['+t+']' + logData, function(){
                logData = null;
                clearInterval(logTimer);
            });
        }
    }
}).listen(port).setTimeout(0);

// 代理http请求
function proxy(proxyRes, opt){
    var url = urlMode.parse(opt.url);
    var options = {
        method: opt.type,
        host: (url.host || '').replace(/\:.+$/, '') || opt.host,
        port: url.port || 80,
        path: url.pathname
    };
    if (opt.type==='POST') {
        if (opt.accessToken && !url.host) {
            opt.data += '&accessToken=' + opt.accessToken;
        }
        options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',  
            'Content-Length': opt.data.length  
        };
    } else {
        if (opt.accessToken && !url.host) {
            url.query += '&accessToken=' + opt.accessToken;
        }
    }
    options.path += url.query ? '?' + url.query : ''; // 补全url
    var req = http.request(options, function(res){
        var body = '';
        if (res.statusCode == 200) {
            res.on('data', function(data){
                body += data;
            }).on('end', function(){
                proxyRes.writeHead(200, {'Access-Control-Allow-Origin': '*'});
                proxyRes.end(body);
                logData = 'Http RESPONSE ' + body;
            });
        } else {
            proxyRes.writeHead(res.statusCode, {'Access-Control-Allow-Origin': '*'});
            proxyRes.end('error');
            logData = 'Http Error';
        }
    });
    if (opt.type==='POST') {
        req.write(opt.data + '\n');
    }
    req.end();
}

// 获取单条运行数据
function getSingleRunData(data){
    var ret = {};
    var last = false;
    try {
        var jsonData = JSON.parse(data);
        ret = jsonData[runningDataIndex];
        runningDataIndex ++;
        if (runningDataIndex >= jsonData.length) {
            last = true;
            runningDataIndex = 0;
        }
    } catch (err) {
        last = true;
    }
    return {last:last, data:ret};
}

function getFile(file) {
    var fix = file.match(/\.[a-z]{1,4}/i)[0];
    var data = '';
    var type = ({
        '.txt'  : 'text/plain',
        '.htm'  : 'text/html',
        '.html' : 'text/html',
        '.css'  : 'text/css',
        '.js'   : 'application/javascript',
        '.json' : 'application/json'
    })[fix] || 'text/plain';
    try {
        data = fs.readFileSync(file);
        return {code : 200, type : type, data : data};
    } catch(err) {
        return {code : 404, type : type, data : data};
    }
}

// 获取app数据
function getAppData(app, key){
    try {
        var ret = '';
        var data = fs.readFileSync('apps/' + app + '.json');
        data = JSON.parse(data);
        ret = key ? data[key] : data;
        return typeof ret === 'string' ? ret : JSON.stringify(ret);
    } catch(err) {
        return null;
    }
}

// 获取url参数
function getUrlParam(search, sName){
    if (!search) return '';
    var reg = new RegExp('(^|&)' + sName + '=([^&]*)(&|$)', 'i');
    var r = search.substr(1).match(reg);
    if (r != null)
        return decodeURIComponent(r[2]); // (r[2]);
    return '';
}