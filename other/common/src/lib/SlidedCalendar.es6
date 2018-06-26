'use strict';
/**
 * 滑动式日期区间选择器
 * !! 因为需要跳转页面，所以需要配置路由来调用。配置方法参见eg
 * @route {string}  :cbName     点确定时的回调函数名。该回调须登记于window下，否则将无法调用。
 *                              该回调返回date对象，格式：{startDate: Date1, endDate: Date2}
 * @route {date}    :startDate  开始时间，可选。格式：'2016-1-1'
 * @route {date}    :endDate    结束时间，可选。格式：'2016-1-1'
 * @route {integer} :months     可选月数，缺省为12个月
 * @route {string}  :validDates 有数据的日期数组，格式：'2016-1-1, 2016-1-2, ...'
 * @route {string}  :top        距离顶部的距离，默认为0
 * @eg.   <Route path="/datepicker/:startDate/:endDate/:cbName/:validDates" component={SlidedCalendar} />
 */

// 创建React组件
export class SlidedCalendar extends React.Component {
    constructor(props) {
        super(props);
        let _this = this;
        this.top = props.params.top ? props.params.top : 0;
        this.calendar = this.createCalendarData(this.props.months || 12);
        this.state = {
            validDates : (props.params.validDates||'').split(',').map((d)=>this.zeroTimestamp(d)),
            startDate : props.params.startDate ? _this.zeroTimestamp(props.params.startDate) : Infinity,
            endDate : props.params.endDate ? _this.zeroTimestamp(props.params.endDate) : 0
        };
        this.touchCounter = 0; // 点击计数器
        this.selectDate = this.selectDate.bind(this);
        this.submit = this.submit.bind(this);
    }
    componentDidMount(){
        let main = ReactDOM.findDOMNode(this.refs.main);
        document.body.scrollTop = main.scrollHeight;
    }
    // 生成0点时间戳，用于对比
    zeroTimestamp(date){
        let time = new Date(date.toString().replace(/(?=\b\d\b)/g, '0'));
        time.setHours(0);
        time.setMinutes(0);
        time.setSeconds(0);
        return time.getTime();
    }
    // 生成日历数据
    createCalendarData(forwardMonth){
        forwardMonth = parseInt(forwardMonth);
        let cData = [];
        let cursor = new Date();
        cursor.setMonth(cursor.getMonth() - forwardMonth);
        for (let i=forwardMonth; i>0; i--) {
            cursor.setMonth(cursor.getMonth() + 1);
            cData.push({
                year:cursor.getFullYear(),
                month:cursor.getMonth(),
                data:monthData(cursor)
            });
        }
        function monthData(date){
            let d = new Date(date);
            let wData = []; // 周数据
            let mData=[]; // 月数据
            let m = d.getMonth();
            d.setDate(1);
            for (var h=0; h<d.getDay(); h++) {
                wData.push(0);
            }
            for (let i=0; i<6; i++) {
                for (let j=i===0?h:0; j<7; j++) {
                    if (d.getMonth()-m===0) {
                        wData.push(d.getDate());
                    } else {
                        if ((i>=4)&& j===0) { // 排除最后一周全空的情况
                            break;
                        }
                        wData.push(0);
                    }
                    d.setDate(d.getDate()+1);
                }
                mData.push(wData);
                wData = [];
            }
            return mData;
        }
        return cData;
    }
    selectDate(e){
        let date = parseInt(e.currentTarget.getAttribute('data-date'));
        if (date > (new Date()).getTime()) return; // 不允许选择超过当天的时间
        this.touchCounter ++;
        if (this.touchCounter % 2) {
            this.setState({startDate: date, endDate: 0});
        } else if(this.state.startDate>date) {
            this.touchCounter --;
            this.setState({startDate: date, endDate: 0});
            // alert('结束时间不能小于开始时间');
        } else {
            this.setState({endDate: date});
        }
    }
    submit(e){
        e.preventDefault();
        let _this = this;
        let cb = window[this.props.params.cbName];
        if (!this.state.endDate) return;
        if (typeof cb==='function') {
            cb({
                startDate : new Date(_this.state.startDate),
                endDate : new Date(_this.state.endDate)
            });
        }
        setTimeout(()=>history.back(), 100);
    }
    render(){
        let today = this.zeroTimestamp((new Date).toString());
        return <div ref='main' className="slided-calendar" style={{top:this.top}}>
            <ul className="sc-row head" style={{top:this.top}}>
                <li>日</li>
                <li>一</li>
                <li>二</li>
                <li>三</li>
                <li>四</li>
                <li>五</li>
                <li>六</li>
            </ul>
            {this.calendar.map((m, idx1)=>{ // 遍历月份
                return <section key={idx1}>
                    <h2>{m.year}年{m.month+1}月</h2>
                    {m.data.map((w, idx2)=>{ // 遍历周
                        return <ul key={idx2} className="sc-row">
                            {w.map((d, idx3)=>{ // 遍历天
                                if (d!==0) {
                                    let theDay = this.zeroTimestamp(`${m.year}-${m.month+1}-${d}`);
                                    let txt = theDay===today ? '今' : d;
                                    let classNames = '';
                                    // 当天0时时间戳
                                    // 有效日期样式
                                    classNames += this.state.validDates.indexOf(theDay)>-1 ? ' sc-vali' : '';
                                    // 今天样式
                                    classNames += theDay===today ? ' sc-today' : '';
                                    // 开始样式
                                    classNames += theDay===this.state.startDate ? ' sc-start' : '';
                                    // 结束样式
                                    classNames += theDay===this.state.endDate ? ' sc-end' : '';
                                    // 区间样式
                                    classNames += (theDay>this.state.startDate && theDay<this.state.endDate) ? ' sc-among' : '';
                                    return <li key={idx3} className={classNames} data-date={theDay} onClick={this.selectDate}><i>{txt}</i></li>;
                                } else {
                                    return <li key={idx3} className="sc-e">&nbsp;</li>;
                                }
                            })}
                        </ul>;
                    })}
                </section>;
            })}
            <footer className="sc-footer">
                <a href="#" onTouchEnd={this.submit} className={this.state.endDate?'enable':''}>确定</a>
            </footer>
        </div>;
    }
};