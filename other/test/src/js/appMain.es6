// import {Funs} from '../../../common/src/fun.es6';
import {BaseComponent} from '../../../common/src/BaseComponent.class.es6';
import {Actions} from './Actions.es6';
import {Store} from './Store.es6';

var {Router, Route, hashHistory} = ReactRouter;

het.domReady(()=>{
    // 配置sdk
    het.config({
        debugMode: 'print', // 打印调试数据
        updateFlagMap: {
        }
    });
});

// 接收app推送的运行数据
het.updateRunData((data)=>{
    Actions.updateRunData(data);
});

// 接收app推送的控制数据
het.updateControlData((data)=>{
    Actions.updateControlData(data);
});

// 接收app推送的故障数据
het.updateErrorData((data)=>{
    Actions.updateErrorData(data);
});

// 接收app推送的配置数据
het.updateConfigData((data)=>{
    Actions.updateConfigData(data);
});

// 接收app推送的在线离线状态
het.updateOnOffState((data)=>{
    Actions.updateOnOffState(data);
});

// 创建React组件
class App extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.listenStore(Store); // 监听Store
    }
    handleTouchTap(e) {
        console.log('touchTap事件测试');
    }
    render() {
        return <div onTouchTap={this.handleTouchTap.bind(this)}>receive: {JSON.stringify(this.state)}</div>;
    }
}

// 开始渲染
het.domReady(()=>{
    het.setTitle('C-Life 设备控制');
    // 无路由方式
    ReactDOM.render(<App />, document.getElementById('ROOT'));

    // 路由方式
    /*ReactDOM.render((
        <Router history={hashHistory}>
            <Route path="/" component={App} />
        </Router>
    ), document.getElementById('ROOT'));*/
});