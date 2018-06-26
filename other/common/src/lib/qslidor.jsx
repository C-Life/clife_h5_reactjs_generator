/**
 * 滑动选择器组件
 * @prop {array}    items       传入组件，格式：[{id:ID,text:TEXT},..]
 * @prop {integer}  value       传入初始值
 * @prop {boolean}  disabled    是否可以点击
 * @prop {function} fnFeedback  用于接收处理结果的函数
 */
var QSlidor = React.createClass({
    getInitialState: function(){
        return {};
    },
    slidable : false,
    XY : {startX:0, startY:0, endX:0, endY:0},
    handlerTouchStart : function(e) {
        var touchs = e.originalEvent ? e.originalEvent.touches : e.targetTouches;
        var cursor = ReactDOM.findDOMNode(this.refs["cursor"]);
        this.XY.startX = this.XY.endX = touchs[0].pageX;
        this.XY.startY = this.XY.endY = touchs[0].pageY;
        // 检测滑动是否有效
        if(touchs.length===1 && !this.props.disabled) {
            cursor.style.marginLeft = 0;
            this.props.items.forEach(function(item){
                var el = ReactDOM.findDOMNode(this.refs["item" + item.id]);
                if (this.XY.startX >= el.offsetLeft && this.XY.startX <= el.offsetLeft + el.offsetWidth) {
                    // 检测是否位于已激活的选项内开始滑动的。如否，则不允许滑动
                    // this.slidable = el.className.indexOf("active")>-1; 
                    this.slidable = true;
                }
            }.bind(this));
        }
    },
    handlerTouchMove : function(e) {
        var touchs = e.originalEvent ? e.originalEvent.touches : e.targetTouches;
        var parent = ReactDOM.findDOMNode(this.refs["qslider"]);
        var cursor = ReactDOM.findDOMNode(this.refs["cursor"]);
        var left = touchs[0].pageX - parent.offsetLeft - cursor.offsetWidth / 2;
        e.preventDefault();
        if (this.slidable) {
            cursor.style.opacity = 1;
            cursor.style.left = left + "px";
        }
    },
    handlerTouchEnd : function(e) {
        var touchs = e.originalEvent ? e.originalEvent.touches : e.changedTouches;
        var parent = ReactDOM.findDOMNode(this.refs["qslider"]);
        var cursor = ReactDOM.findDOMNode(this.refs["cursor"]);
        var ml = 0;
        this.XY.endX = touchs[0].pageX;
        this.XY.endY = touchs[0].pageY;
        if (this.slidable) {
            this.props.items.forEach(function(item){
                var el = ReactDOM.findDOMNode(this.refs["item" + item.id]);
                if (this.XY.endX >= el.offsetLeft && this.XY.endX <= el.offsetLeft + el.offsetWidth) {
                    ml = el.offsetLeft - (this.XY.endX - parent.offsetLeft - cursor.offsetWidth * 3 / 2);
                    cursor.style.marginLeft = ml + "px";
                    cursor.style.opacity = 0;
                    this.sendResult(item.id);
                }
            }.bind(this));
        }
        this.slidable = false;
    },
    sendResult : function(value) {
        this.setState({value:value});
        if (typeof this.props.fnFeedback === "function") {
            this.props.fnFeedback(value); // 反馈处理结果
        }
    },
    render : function() {
        var value = typeof this.state.value !== "undefined" && this.oldPropValue === this.props.value ? this.state.value : this.props.value;
        this.oldPropValue = this.props.value; // oldPropValue用于比较prop修改时的状态
        this.state.value = value; // 强行保持state与value同步
        return (
            <menu ref="qslider" className="qslider flex" onTouchStart={this.handlerTouchStart} onTouchEnd={this.handlerTouchEnd}  onTouchMove={this.handlerTouchMove}>
                <i ref="cursor" className="qslider-cursor"></i>
                {this.props.items.map(function(item, key){
                    return (
                        <a key={key} ref={"item" + item.id} className={"flex-cell " + (item.id == value ? "active" : "")}>
                            <i></i>
                            {item.text}
                        </a>
                    );
                }.bind(this))}
            </menu>
        );
    }
});

module.exports = QSlidor;
