//确保jquery已经被引入index.html中


//css扩展

/**
 * 算出各个类中css属性的差值，只能传入类名，和以长度为单位的属性，最少传入4个参数
 * @param  {[type]} args 类名和css属性
 * @return {[type]}      做差后所得到的值
 */
$.lengthSub = function(...args){
    if(args.length < 4 || args.length%2 != 0){
        console.log("input params error");
        return '0px';
    }
    let value = parseInt(getAttribute(args[0],args[1]));

    for (var i = 2; i < args.length;) {
        let sub = parseInt(getAttribute(args[i],args[i+1]));
        value -= sub;
        i += 2;
    }
    return (value+"px");
}

function getAttribute(className,attribute){
    return $("."+className).css(attribute);
}

$.lengthAdd = function(...args){
    if(args.length < 4 || args.length%2 != 0){
        console.log("input params error");
        return '0px';
    }
    let sum = parseInt(getAttribute(args[0],args[1]));

    for (var i = 2; i < args.length;) {
        let value = parseInt(getAttribute(args[i],args[i+1]));
        sum += value;
        i += 2;
    }
    return (sum+"px");
}

$.parseIntInvalidToZero = function(ele){
    let value = parseInt(ele);
    value = isNaN(value)?0:value;
    return value;
}

$.parseIntInvalidToNegativeOne = function(ele){
    let value = parseInt(ele);
    value = isNaN(value)?-1:value;
    return value;
}

String.prototype.toTwoHex = function(){
    let value = $.parseIntInvalidToZero(this);
    let hex = value.toString(16);
    if(hex.length == 1){
        return "0"+hex;
    }else {
        return hex.slice(-2);
    }
}

console.log("xxxx");

Number.prototype.toTwoHex = function(){
    let value = $.parseIntInvalidToZero(this);
    let hex = value.toString(16);
    if(hex.length == 1){
        return "0"+hex;
    }else {
        return hex.slice(-2);
    }
}
