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

// 接收app推送数据
het.repaint((data, type)=>{
    Actions.repaint(data, type);
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