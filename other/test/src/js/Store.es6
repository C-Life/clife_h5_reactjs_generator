'use strict';
/**
 * 公共store，建议所有store事件都在此文件定义
 * ! 注意，Store方法不能使用箭头函数，否则将报this未定义
 * @type {store}
 */
import {Actions} from './Actions.es6';

export const Store = Reflux.createStore({
    listenables: [Actions],
    onRepaint(data, type){
        this.trigger(data);
    }
});