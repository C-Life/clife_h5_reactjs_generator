'use strict';
/**
 * 圆弧滑动组件
 * @prop {number} minAngle  最小滑动角度(默认为0)
 * @prop {number} maxAngle 最大滑动角度(默认为360)
 * @prop {number} minValue  最小滑动值(默认为0)
 * @prop {number} maxValue 最大滑动值(默认为100)
 * @prop {number} boundaryWidth 弧线边界宽度(默认为0,用于居中滑块在边界的位置)
 * @prop {function} callClock 滑动时触发回调函数(默认不触发,传入函数时触发)
 * @prop {number} defaultValue 默认选中的值(默认值为0) !!不要设置为取值范围(minValue~maxValue)外的值
 * @author   xinglin
 */
import {BaseComponent} from './BaseComponent.class.es6';

export class ArcSliding extends BaseComponent{
	constructor(props) {
        super(props);
        this.state = {
        	radius: 0,//圆弧半径
    		centerX:0,//圆心x轴坐标
    		centerY:0 //圆心y轴坐标
        };
        this.componentDidMount = this.componentDidMount.bind(this);
    }
    componentDidMount() {
    	//初始化设置,获取元素半径,圆心x轴坐标,圆心y轴坐标,默认值处理
    	// let boundaryWidth = this.props.boundaryWidth || 0;
    	let ArcSliding =  ReactDOM.findDOMNode(this.refs.ArcSliding);
    	let radius = ArcSliding.offsetWidth/2;
    	let centerX = ArcSliding.offsetLeft+radius;
    	let centerY = ArcSliding.offsetTop+radius;
    	let defaultAngle = 0;
    	if(this.props.defaultValue !== undefined){
    		let minAngle = this.props.minAngle ? this.props.minAngle-90 : -90;
	    	let maxAngle = this.props.maxAngle ? this.props.maxAngle-90 : 270;
	    	let minValue = this.props.minValue || 0;
	    	let maxValue = this.props.maxValue || 100;
    		defaultAngle = (this.props.defaultValue-minValue)*(maxAngle-minAngle)/(maxValue-minValue)+minAngle;
    	}
    	this.setState({
    		radius: radius,
    		centerX:centerX,
    		centerY:centerY,
    		defaultAngle:defaultAngle
    	});
    }
    componentWillReceiveProps(nextProps){
    	//接收到新的默认值时更新位置
    	if(this.props.defaultValue !== nextProps.defaultValue){
    		let minAngle = nextProps.minAngle ? nextProps.minAngle-90 : -90;
	    	let maxAngle = nextProps.maxAngle ? nextProps.maxAngle-90 : 270;
	    	let minValue = nextProps.minValue || 0;
	    	let maxValue = nextProps.maxValue || 100;
    		let abc = (nextProps.defaultValue-minValue)*(maxAngle-minAngle)/(maxValue-minValue)+minAngle;
    		this.setState({
    			abc:abc
    		});
    	}
    }
    startMove(e){
    	//开始拖动,记录初始坐标
        e.preventDefault();
        e.stopPropagation();
        this.clientX = e.touches[0].clientX;
        this.clientY = e.touches[0].clientY;
    }
    moveIng(e){
    	//拖动中,根据拖动的偏移量计算拖动后的位置,忽略偏移太大的拖动
        e.preventDefault();
        e.stopPropagation();
        let distance = Math.pow(e.touches[0].clientX-this.state.centerX,2)+Math.pow(e.touches[0].clientY-this.state.centerY,2);
        let radius = Math.pow(this.state.radius,2);
        if((distance-radius)<6400&&(distance-radius)>-6400){
            let sin = (e.touches[0].clientY-this.state.centerY)/Math.sqrt(distance);
            let rotuer = Math.asin(sin)*180/Math.PI;
            if(e.touches[0].clientX>this.state.centerX&&e.touches[0].clientY<this.state.centerY) rotuer = 180-Math.abs(rotuer);
            if(e.touches[0].clientX>this.state.centerX&&e.touches[0].clientY>=this.state.centerY) rotuer = 180+Math.abs(rotuer);
            if(e.touches[0].clientX<=this.state.centerX&&e.touches[0].clientY<this.state.centerY) rotuer = Math.abs(rotuer);
            if(e.touches[0].clientX<=this.state.centerX&&e.touches[0].clientY>=this.state.centerY) rotuer = -Math.abs(rotuer);
            if(Math.abs(rotuer-this.state.abc)>=90) return;
            this.setState({
                abc:rotuer
            });
        }
    }
    endMove(e){
    	//结束拖动,如果需要返回值,则返回拖动的值
        e.preventDefault();
        e.stopPropagation();
        if(typeof this.props.callback === 'function'){
        	let rotuer = this.state.abc;
        	let value;
	    	let minAngle = this.props.minAngle ? this.props.minAngle-90 : -90;
	    	let maxAngle = this.props.maxAngle ? this.props.maxAngle-90 : 270;
	    	let minValue = this.props.minValue || 0;
	    	let maxValue = this.props.maxValue || 100;
	        if(rotuer<minAngle) value = minValue;
	        if(rotuer>maxAngle) value = maxValue;
	        value = value!==undefined?value:((rotuer-minAngle)/(maxAngle-minAngle))*(maxValue-minValue)+minValue;
        	this.props.callback(value);
        }
    }
    startChange(e){
    	//开始点击切换位置,记录点击坐标
        e.preventDefault();
        e.stopPropagation();
        this.initX = e.touches[0].clientX;
        this.initY = e.touches[0].clientY;
    }
    endChange(e){
    	//切换位置点击结束,根据偏移量计算切换后的位置,如需返回值,则回调返回值
        e.preventDefault();
        e.stopPropagation();
        let distance = Math.pow(this.initX-this.state.centerX,2)+Math.pow(this.initY-this.state.centerY,2);
        let radius = Math.pow(this.state.radius,2);
        if((distance-radius)<3600&&(distance-radius)>-3600){
            let sin = (this.initY-this.state.centerY)/Math.sqrt(distance);
            let rotuer = Math.asin(sin)*180/Math.PI;
            if(this.initX>this.state.centerX&&this.initY<this.state.centerY) rotuer = 180-Math.abs(rotuer);
            if(this.initX>this.state.centerX&&this.initY>=this.state.centerY) rotuer = 180+Math.abs(rotuer);
            if(this.initX<=this.state.centerX&&this.initY<this.state.centerY) rotuer = Math.abs(rotuer);
            if(this.initX<=this.state.centerX&&this.initY>=this.state.centerY) rotuer = -Math.abs(rotuer);
            this.setState({
                abc:rotuer
            });
            if(typeof this.props.callback === 'function'){
            	let value;
		    	let minAngle = this.props.minAngle ? this.props.minAngle-90 : -90;
		    	let maxAngle = this.props.maxAngle ? this.props.maxAngle-90 : 270;
		    	let minValue = this.props.minValue || 0;
		    	let maxValue = this.props.maxValue || 100;
		        if(rotuer<minAngle) value = minValue;
		        if(rotuer>maxAngle) value = maxValue;
		        value = value!==undefined?value:((rotuer-minAngle)/(maxAngle-minAngle))*(maxValue-minValue)+minValue;
            	this.props.callback(value);
            }
        }
    }
    render(){
    	let abc = this.state.abc || this.state.defaultAngle || 0;
    	let minAngle = this.props.minAngle ? this.props.minAngle-90 : -90;
    	let maxAngle = this.props.maxAngle ? this.props.maxAngle-90 : 270;
    	let boundaryWidth = this.props.boundaryWidth || 0;
        if(abc<minAngle) abc = minAngle;
        if(abc>maxAngle) abc = maxAngle;
        const PI = Math.PI;
        let top = this.state.radius-(this.state.radius-boundaryWidth/2)*Math.sin(abc*2*PI/360);
        let left = this.state.radius-(this.state.radius-boundaryWidth/2)*Math.cos(abc*2*PI/360);
    	return(
    		<div className = "ArcSliding" ref="ArcSliding" onTouchStart={this.startChange.bind(this)} onTouchEnd={this.endChange.bind(this)}>
                <div onTouchStart={this.startMove.bind(this)} onTouchMove={this.moveIng.bind(this)} onTouchEnd={this.endMove.bind(this)}
                style={{top:top+"px",left:left+"px"}}></div>
            </div>
    	)
    }
}