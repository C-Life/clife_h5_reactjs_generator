export class BaseComponent extends React.Component {
    constructor(props){
        super(props);
        let originComponentDidMount = this.componentDidMount; // 接管子类方法
        let originComponentWillUnmount = this.componentWillUnmount; // 接管子类方法
        this.state = {};
        this._isMounted = false;
        // 重定义子类componentDidMount
        this.componentDidMount = ()=>{
            this.superComponentDidMount();
            if (typeof originComponentDidMount === 'function') {
                originComponentDidMount.call(this);
            }
        };
        // 重定义子类componentWillUnmount
        this.componentWillUnmount = ()=>{
            this.superComponentWillUnmount();
            if (typeof originComponentWillUnmount === 'function') {
                originComponentWillUnmount.call(this);
            }
        };
    }

    /**
     * 监听Store通用方法
     * @param    {object}   store   Reflux之Store对象
     */
    listenStore(store){
        store.listen((data)=> {
            if (this.isMounted()) {
                this.setState(data);
            }
        });
    }
    // 基类DidMount方法
    superComponentDidMount(){
        this._isMounted = true;
    }
    // 基类WillUnmount方法
    superComponentWillUnmount(){
        this._isMounted = false;
    }
    // 判断组件是否已挂载
    isMounted(){
        return this._isMounted;
        // exceptions for flow control :(
        /*if (!this._isMounted) {
            try {
                ReactDOM.findDOMNode(this);
                this._isMounted = true;
            } catch (e) {
                // Error: Invariant Violation: Component (with keys: props,context,state,refs,_reactInternalInstance) contains `render` method but is not mounted in the DOM
                this._isMounted = false;
            } 
        }
        return this._isMounted;*/
    }
};