/**
 * 图片懒加载组件
 * @props src     {string} 图片地址
 * @props default {string} 缺省图片地址，如不提供，将无懒加载效果
 */
export class LazyImg extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        let img = new Image();
        img.onload = ()=>{
            ReactDOM.findDOMNode(this.refs.img).src = this.props.src;
        };
        img.src = this.props.src;
    }
    render(){
        let imgSrc = this.props.default ? this.props.default : this.props.src;
        return <img ref="img" src={imgSrc} />; 
    }
};