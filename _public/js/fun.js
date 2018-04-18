var Funs = {
	/*
     * 获取url参数
     * sName ：参数名
     * return : 返回参数值（没有的时候返回空）
     */
    getUrlParam : function(sName){
        var reg = new RegExp("(^|&)" + sName + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null)
            return decodeURIComponent(r[2]); // (r[2]);
        return "";
    },

    /**
     * 合并对象
     * target  target 对象
     * return 合并后对象 
     */
    _extends:function (target) { 
        for (var i = 1; i < arguments.length; i++) { 
            var source = arguments[i]; 
            for (var key in source) { 
                if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; }
            }
        } 
        return target; 
    },// 公共函数模块
    /**
     * 格式化时间函数
     * @param    {string}   date   日期字符串或时间戳
     * @param    {string}   format 格式，缺省为：yyyy-MM-dd hh:mm:ss
     * @param    {Boolean}  isUTC  是否UTC时间，如传入为UTC时间，将自动转为本地时间
     * @return   {string}          按format格式输出日期
     */
    dateFormat : function(date, format, isUTC) {
        var timezoneOffset = 0;
        var dateObj = new Date(date);
        var patt = /^(?:(\d+)-(\d+)-(\d+))?\s?(?:(\d+):(\d+):(\d+))?$/;
        var dateArr;
        var now = new Date();
        // IOS 解析失败时尝试手动解析
        if (dateObj.toString() === 'Invalid Date' && typeof date === 'string') {
            dateArr = date.match(patt) || [];
            dateObj = new Date(
                dateArr[1] || now.getFullYear(),
                (dateArr[2]-1) || now.getMonth(),
                dateArr[3] || now.getDate(),
                dateArr[4] || now.getHours(),
                dateArr[5] || now.getMinutes(),
                dateArr[6] || now.getSeconds()
            );
        }
        format = format || 'yyyy-MM-dd hh:mm:ss';
        if (isUTC) { // 处理utc时间
            timezoneOffset = (new Date()).getTimezoneOffset();
            dateObj.setMinutes(dateObj.getMinutes() - timezoneOffset);
        }
        var map = {
            'M': dateObj.getMonth() + 1, //月份 
            'd': dateObj.getDate(), //日 
            'h': dateObj.getHours(), //小时 
            'm': dateObj.getMinutes(), //分 
            's': dateObj.getSeconds(), //秒 
            'q': Math.floor((dateObj.getMonth() + 3) / 3), //季度 
            'S': dateObj.getMilliseconds() //毫秒 
        };
        format = format.replace(/([yMdhmsqS])+/g, function(all, t){
            var v = map[t];
            if (v !== undefined) {
                if (all.length > 1) {
                    v = '0' + v;
                    v = v.substr(v.length-2);
                }
                return v;
            } else if(t === 'y') {
                return (dateObj.getFullYear() + '').substr(4 - all.length);
            }
            return all;
        });
        return format;
    },
    /**
     * [dateFormatFull description]
     * @param  {[type]} dateTime [时间戳]
     * @param  {[type]} type     [“-”] 返回2016-07-30   [“month”] 返回2016-07    [“day”] 返回 日   
     * @param  {[type]} flag     [1]  返回12：30
     * @return {[type]}          [description]
     */
    dateFormatFull:function(dateTime, type,flag) {
        var d = new Date(dateTime*1000),
            y = d.getFullYear(),
            m = d.getMonth() + 1,
            day = d.getDate(),
            h = d.getHours(),
            mn = d.getMinutes(),
            s = d.getSeconds(),
            res;
            m = m > 9 ? m : '0' + m;
            day = day > 9 ? day : '0' + day;
            h = h > 9 ? h : '0' + h;
            mn = mn > 9 ? mn : '0' + mn;
            s = s > 9 ? s : '0' + s;    
        if ( type === '-' ) {
          res =  y + '-' + m + '-' + day ;
          if(flag)
          {
            res = h + ':' + mn ;
          }
        }
         else if ( type === 'month' ) {
          res =  y + '-' + m ;
        }
        else if ( type === 'day' ) {
          res =d.getDate();
        }else if ( type === 'full' ) {
          res =y + '-' + m + '-' + day+" "+ h + ':' + mn ;
        }
        return res;
    },
    /**
     * [utcToLocal utc时间转换为本地时间]
     * @param  {[type]} utc [utc 时间 格式为‘2016-06-06 12:12:12’]
     * @param  {[type]} type [返回格式  1：时+分 ]
     * @return {[type]}     [description]
     */
    utcToLocal:function(utc,type){
      let utcDay= utc.split(' '),
          utcDate=utcDay[0].split('-'),
          utcTime=utcDay[1].split(':'),
          timestamp=Math.round(Date.UTC(utcDate[0],utcDate[1]-1,utcDate[2],utcTime[0],utcTime[1],utcTime[2])/1000),
          time=this.dateFormatFull(timestamp,"full");
      if(type==1){
        time=this.dateFormatFull(timestamp,"-",1);
      }    
      return time;
    },
    timestampToUtc:function(timestamp,type){
      var d = new Date(timestamp*1000),
            y = d.getUTCFullYear(),
            m = d.getUTCMonth() + 1,
            day = d.getUTCDate(),
            h = d.getUTCHours(),
            mn = d.getUTCMinutes(),
            s = d.getUTCSeconds(),
            res;
            m = m > 9 ? m : '0' + m;
            day = day > 9 ? day : '0' + day;
            h = h > 9 ? h : '0' + h;
            mn = mn > 9 ? mn : '0' + mn;
            s = s > 9 ? s : '0' + s; 
       if ( type === '-' ) {
          res =y + '-' + m + '-' + day+" "+ h + ':' + mn + ':' + s;
        }
        return res;
    },
    // 设置cookies
    setCookie:function(name,value) {
        var Days = 30; 
        var exp = new Date(); 
        exp.setTime(exp.getTime() + Days*24*60*60*1000); 
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ";path=/"; 
    },
    // 获取cookies
    getCookie:function(name){
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
            return unescape(arr[2]); 
        else 
            return null; 
    },
    // 删除cookies
    delCookie: function(name) {
        var exp = new Date(); 
        exp.setTime(exp.getTime() - 1); 
        var cval=getCookie(name); 
        if(cval!==null) 
            document.cookie= name + "="+cval+";expires="+exp.toGMTString() + ";path=/"; 
    }
};
module.exports = Funs;