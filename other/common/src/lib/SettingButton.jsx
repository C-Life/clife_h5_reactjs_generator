/**
 * 保存设置按钮组件
 * @prop {string} settingStatus  设置按钮状态
 * @act  {function} this.props.callback 点击保存时触发
 */
var SettingButton = React.createClass({
    getInitialState: function(){
        return {
            valueH : 0
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({
            settingBtnStatus:nextProps.settingStatus
        });
    },
    TouchStart: function(e){
        var status = this.state.settingBtnStatus || this.props.settingStatus || 'off';
        if(status=='off') return;
        let startY = parseInt(e.touches[0].clientY);
        let oldValue = parseInt(this.state.valueH);
        // var status = this.state.settingBtnStatus=='active'?'on':'active';
        this.setState({
            startY:startY,
            oldValue:oldValue
        });
    },
    TouchMove:function(e){
        if(this.state.settingBtnStatus=='off') return;
        let newY = parseInt(e.touches[0].clientY);
        let oldY = parseInt(this.state.startY);
        let valueH = parseInt(this.state.oldValue)+newY-oldY;
        this.setState({
            newY:newY,
            valueH:valueH
        });
    },
    TouchEnd:function(e){
        var _this = this;
        if(_this.state.settingBtnStatus=='off') return;
        let newY = _this.state.newY || this.state.startY;
        let disY = newY-_this.state.startY;
        let offsetValue = parseInt(_this.state.oldValue);
        let oldValue = parseInt(_this.state.valueH);
        let offset = oldValue<offsetValue? (offsetValue-oldValue) : (oldValue-offsetValue);
        if(offset <= 20){
            var status = _this.state.settingBtnStatus=='active'?'on':'active';
            _this.setState({
                settingBtnStatus:status
            });
            clearInterval(_this.timer);
            _this.timer = setTimeout(function(){
                if(typeof _this.props.callback === 'function'){
                    _this.props.callback();
                }
            },50);
        }else{
            return;
        }
    },
    componentWillUnmount:function(){
        clearInterval(this.timer);
    },
    render : function() {
        var idx = this.state.settingBtnStatus || this.props.settingStatus || 'off';
        return (
            <section onTouchStart={this.TouchStart} onTouchMove={this.TouchMove} onTouchEnd={this.TouchEnd} className={"settingbtn-"+idx}>
                <em>保存</em>
            </section>
        );
    }
});
module.exports = SettingButton;