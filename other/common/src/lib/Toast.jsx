/**
 * toast组件，用于弹出提示信息
 * 使用该组件时，需导入toast.css文件
 * @prop {integer} verticalAlign  垂直对齐，缺省为1，取值0-2，对应top、middle、bottom
 * @prop {boolean} block          是否宽幅，缺省为false
 * @prop {integer} secs           显示时间，缺省为2s
 */
var Toast = React.createClass({
    aligns : [{top:0,left: 0}, {bottom:100,left: 0}, {bottom:0,left: 0}],
    anim : ["toastD", "toastN", "toastU"],
    render : function() {
        var va = typeof this.props.verticalAlign === "undefined" ? 1 : this.props.verticalAlign;
        var secs = typeof this.props.secs !== "undefined" ? this.props.secs : 2;
        var css = this.aligns[va];
        css.animation = this.anim[va] + " " + (+secs + 2) + "s";
        // 兼容旧版
        css["WebkitAnimation"] = css.animation;
        css["MozAnimation"] = css.animation;
        css["OAnimation"] = css.animation;
        return (
            <section style={css} className="toast">
                <div className={this.props.block ? "block" : "span"}>{this.props.children}</div>
            </section>
        );
    }
});

module.exports = Toast;
