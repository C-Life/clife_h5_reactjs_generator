'use strict';
/**
 * 公共store，建议所有store事件都在此文件定义
 * ! 注意，Store方法不能使用箭头函数，否则将报this未定义
 * @type {store}
 */
import {Actions} from './Actions.es6';

export const Store = Reflux.createStore({
    listenables: [Actions],
    onUpdateRunData(data){
        this.trigger(data);
    },
    onUpdateControlData(data){
        this.trigger(data);
    },
    onUpdateErrorData(data){
        this.trigger(data);
    },
    onUpdateConfigData(data){
        this.trigger(data);
    },
    onUpdateOnOffState(data){
        // data.onlineStatus 离线在线状态
        // 0 设备不在线 1 设备在线
        this.trigger(data);
    }
});