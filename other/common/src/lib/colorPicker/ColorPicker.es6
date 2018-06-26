/**
 * 颜色拾取组件
 * @prop {boolean}  show    是否显示
 * @prop {function} close   关闭按钮回调函数
 * @prop {function} cb      选择完成时的回调函数
 */
import {Base64Img} from './base64img.es6';

export class ColorPicker extends React.Component{
    constructor() {
        super();
        this.wh = document.body.clientWidth * 0.6;
        this.state = {
            x: this.wh / 2 - 10,
            y: this.wh / 2 - 10,
            r: 255,
            g: 255,
            b: 255,
            a: 1
        };
    }
    componentDidMount() {
        let c = ReactDOM.findDOMNode(this.refs.canvas);
        let cxt=c.getContext('2d');
        let img=new Image();
        img.src=Base64Img;
        img.onload = ()=>{
            cxt.drawImage(img, 0, 0, this.wh, this.wh);
        };
    }
    selectColor(e) {
        let c = ReactDOM.findDOMNode(this.refs.canvas);
        let cxt=c.getContext('2d');
        let offset = this.getOffset(c);
        let x = e.targetTouches[0].pageX - offset.x;
        let y = e.targetTouches[0].pageY - offset.y;
        let rgba = cxt.getImageData(x, y, 1, 1).data;
        this.setState({
            x: x,
            y: y,
            r: rgba[0],
            g: rgba[1],
            b: rgba[2],
            a: rgba[3] / 255
        });
    }
    closePicker(e) {
        e.preventDefault();
        if (typeof this.props.close==='function') {
            this.props.close({
                r: this.state.r,
                g: this.state.g,
                b: this.state.b,
                a: this.state.a
            });
        }
    }
    submitColor(e) {
        if (typeof this.props.cb==='function') {
            this.props.cb({
                r: this.state.r,
                g: this.state.g,
                b: this.state.b,
                a: this.state.a
            });
        }
    }
    getOffset(dom) {
        let xy = {x:0, y:0};
        while (dom.className!='colorpicker' && dom.tagName!='BODY' && dom.tagName!='HTML') {
            xy.x += dom.offsetLeft;
            xy.y += dom.offsetTop;
            dom = dom.parentNode;
        }
        // xy.y += dom.offsetTop;
        xy.y += document.body.scrollTop;
        return xy;
    }
    // 阻止页面滚动
    stopBodyScroll(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    render() {
        let rgba = `rgba(${this.state.r}, ${this.state.g}, ${this.state.b}, ${this.state.a})`;
        return (
            <section className="colorpicker" style={{display:this.props.show?'block':'none'}} onTouchStart={this.closePicker.bind(this)}>
                <div className="cp-wrap" onTouchStart={this.stopBodyScroll}>
                    <div className="cp-hd">
                        <div className="cp-preview" style={{backgroundColor:rgba}}></div>
                        <b onTouchStart={this.closePicker.bind(this)}>X</b>
                    </div>
                    <div ref="wrap" className="canvas-wrap" style={{width:this.wh,height:this.wh}} onTouchMove={this.selectColor.bind(this)}
                        onTouchStart={this.selectColor.bind(this)} onTouchEnd={this.submitColor.bind(this)}>
                        <canvas ref="canvas" width={this.wh} height={this.wh}></canvas>
                        <i style={{top:this.state.y-10, left:this.state.x-10}}></i>
                    </div>
                </div>
            </section>
        );
    }
};
