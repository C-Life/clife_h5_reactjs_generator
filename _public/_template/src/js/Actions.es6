'use strict';
/**
 * 公共Actions，所有action均需统一在此文件登记，以防重名造成store冲突
 * @type {actions}
 */

export const Actions = Reflux.createActions([
    'updateRunData', // 接收到运行数据，重新渲染
    'updateControlData', // 接收到控制数据，重新渲染
    'updateErrorData', // 接收到故障数据，重新渲染
    'updateConfigData', // 接收到配置数据，重新渲染
    'updateOnOffState', // 接收到在线离线状态，重新渲染
]);