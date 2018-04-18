/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

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

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.ArcSliding = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _BaseComponentClass = __webpack_require__(2);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var ArcSliding = exports.ArcSliding = function (_BaseComponent) {
	    _inherits(ArcSliding, _BaseComponent);

	    function ArcSliding(props) {
	        _classCallCheck(this, ArcSliding);

	        var _this = _possibleConstructorReturn(this, (ArcSliding.__proto__ || Object.getPrototypeOf(ArcSliding)).call(this, props));

	        _this.state = {
	            radius: 0, //圆弧半径
	            centerX: 0, //圆心x轴坐标
	            centerY: 0 //圆心y轴坐标
	        };
	        _this.componentDidMount = _this.componentDidMount.bind(_this);
	        return _this;
	    }

	    _createClass(ArcSliding, [{
	        key: 'componentDidMount',
	        value: function componentDidMount() {
	            //初始化设置,获取元素半径,圆心x轴坐标,圆心y轴坐标,默认值处理
	            // let boundaryWidth = this.props.boundaryWidth || 0;
	            var ArcSliding = ReactDOM.findDOMNode(this.refs.ArcSliding);
	            var radius = ArcSliding.offsetWidth / 2;
	            var centerX = ArcSliding.offsetLeft + radius;
	            var centerY = ArcSliding.offsetTop + radius;
	            var defaultAngle = 0;
	            if (this.props.defaultValue !== undefined) {
	                var minAngle = this.props.minAngle ? this.props.minAngle - 90 : -90;
	                var maxAngle = this.props.maxAngle ? this.props.maxAngle - 90 : 270;
	                var minValue = this.props.minValue || 0;
	                var maxValue = this.props.maxValue || 100;
	                defaultAngle = (this.props.defaultValue - minValue) * (maxAngle - minAngle) / (maxValue - minValue) + minAngle;
	            }
	            this.setState({
	                radius: radius,
	                centerX: centerX,
	                centerY: centerY,
	                defaultAngle: defaultAngle
	            });
	        }
	    }, {
	        key: 'componentWillReceiveProps',
	        value: function componentWillReceiveProps(nextProps) {
	            //接收到新的默认值时更新位置
	            if (this.props.defaultValue !== nextProps.defaultValue) {
	                var minAngle = nextProps.minAngle ? nextProps.minAngle - 90 : -90;
	                var maxAngle = nextProps.maxAngle ? nextProps.maxAngle - 90 : 270;
	                var minValue = nextProps.minValue || 0;
	                var maxValue = nextProps.maxValue || 100;
	                var abc = (nextProps.defaultValue - minValue) * (maxAngle - minAngle) / (maxValue - minValue) + minAngle;
	                this.setState({
	                    abc: abc
	                });
	            }
	        }
	    }, {
	        key: 'startMove',
	        value: function startMove(e) {
	            //开始拖动,记录初始坐标
	            e.preventDefault();
	            e.stopPropagation();
	            this.clientX = e.touches[0].clientX;
	            this.clientY = e.touches[0].clientY;
	        }
	    }, {
	        key: 'moveIng',
	        value: function moveIng(e) {
	            //拖动中,根据拖动的偏移量计算拖动后的位置,忽略偏移太大的拖动
	            e.preventDefault();
	            e.stopPropagation();
	            var distance = Math.pow(e.touches[0].clientX - this.state.centerX, 2) + Math.pow(e.touches[0].clientY - this.state.centerY, 2);
	            var radius = Math.pow(this.state.radius, 2);
	            if (distance - radius < 6400 && distance - radius > -6400) {
	                var sin = (e.touches[0].clientY - this.state.centerY) / Math.sqrt(distance);
	                var rotuer = Math.asin(sin) * 180 / Math.PI;
	                if (e.touches[0].clientX > this.state.centerX && e.touches[0].clientY < this.state.centerY) rotuer = 180 - Math.abs(rotuer);
	                if (e.touches[0].clientX > this.state.centerX && e.touches[0].clientY >= this.state.centerY) rotuer = 180 + Math.abs(rotuer);
	                if (e.touches[0].clientX <= this.state.centerX && e.touches[0].clientY < this.state.centerY) rotuer = Math.abs(rotuer);
	                if (e.touches[0].clientX <= this.state.centerX && e.touches[0].clientY >= this.state.centerY) rotuer = -Math.abs(rotuer);
	                if (Math.abs(rotuer - this.state.abc) >= 90) return;
	                this.setState({
	                    abc: rotuer
	                });
	            }
	        }
	    }, {
	        key: 'endMove',
	        value: function endMove(e) {
	            //结束拖动,如果需要返回值,则返回拖动的值
	            e.preventDefault();
	            e.stopPropagation();
	            if (typeof this.props.callback === 'function') {
	                var rotuer = this.state.abc;
	                var value = void 0;
	                var minAngle = this.props.minAngle ? this.props.minAngle - 90 : -90;
	                var maxAngle = this.props.maxAngle ? this.props.maxAngle - 90 : 270;
	                var minValue = this.props.minValue || 0;
	                var maxValue = this.props.maxValue || 100;
	                if (rotuer < minAngle) value = minValue;
	                if (rotuer > maxAngle) value = maxValue;
	                value = value !== undefined ? value : (rotuer - minAngle) / (maxAngle - minAngle) * (maxValue - minValue) + minValue;
	                this.props.callback(value);
	            }
	        }
	    }, {
	        key: 'startChange',
	        value: function startChange(e) {
	            //开始点击切换位置,记录点击坐标
	            e.preventDefault();
	            e.stopPropagation();
	            this.initX = e.touches[0].clientX;
	            this.initY = e.touches[0].clientY;
	        }
	    }, {
	        key: 'endChange',
	        value: function endChange(e) {
	            //切换位置点击结束,根据偏移量计算切换后的位置,如需返回值,则回调返回值
	            e.preventDefault();
	            e.stopPropagation();
	            var distance = Math.pow(this.initX - this.state.centerX, 2) + Math.pow(this.initY - this.state.centerY, 2);
	            var radius = Math.pow(this.state.radius, 2);
	            if (distance - radius < 3600 && distance - radius > -3600) {
	                var sin = (this.initY - this.state.centerY) / Math.sqrt(distance);
	                var rotuer = Math.asin(sin) * 180 / Math.PI;
	                if (this.initX > this.state.centerX && this.initY < this.state.centerY) rotuer = 180 - Math.abs(rotuer);
	                if (this.initX > this.state.centerX && this.initY >= this.state.centerY) rotuer = 180 + Math.abs(rotuer);
	                if (this.initX <= this.state.centerX && this.initY < this.state.centerY) rotuer = Math.abs(rotuer);
	                if (this.initX <= this.state.centerX && this.initY >= this.state.centerY) rotuer = -Math.abs(rotuer);
	                this.setState({
	                    abc: rotuer
	                });
	                if (typeof this.props.callback === 'function') {
	                    var value = void 0;
	                    var minAngle = this.props.minAngle ? this.props.minAngle - 90 : -90;
	                    var maxAngle = this.props.maxAngle ? this.props.maxAngle - 90 : 270;
	                    var minValue = this.props.minValue || 0;
	                    var maxValue = this.props.maxValue || 100;
	                    if (rotuer < minAngle) value = minValue;
	                    if (rotuer > maxAngle) value = maxValue;
	                    value = value !== undefined ? value : (rotuer - minAngle) / (maxAngle - minAngle) * (maxValue - minValue) + minValue;
	                    this.props.callback(value);
	                }
	            }
	        }
	    }, {
	        key: 'render',
	        value: function render() {
	            var abc = this.state.abc || this.state.defaultAngle || 0;
	            var minAngle = this.props.minAngle ? this.props.minAngle - 90 : -90;
	            var maxAngle = this.props.maxAngle ? this.props.maxAngle - 90 : 270;
	            var boundaryWidth = this.props.boundaryWidth || 0;
	            if (abc < minAngle) abc = minAngle;
	            if (abc > maxAngle) abc = maxAngle;
	            var PI = Math.PI;
	            var top = this.state.radius - (this.state.radius - boundaryWidth / 2) * Math.sin(abc * 2 * PI / 360);
	            var left = this.state.radius - (this.state.radius - boundaryWidth / 2) * Math.cos(abc * 2 * PI / 360);
	            return React.createElement(
	                'div',
	                { className: 'ArcSliding', ref: 'ArcSliding', onTouchStart: this.startChange.bind(this), onTouchEnd: this.endChange.bind(this) },
	                React.createElement('div', { onTouchStart: this.startMove.bind(this), onTouchMove: this.moveIng.bind(this), onTouchEnd: this.endMove.bind(this),
	                    style: { top: top + "px", left: left + "px" } })
	            );
	        }
	    }]);

	    return ArcSliding;
	}(_BaseComponentClass.BaseComponent);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _BaseComponentClass = __webpack_require__(3);

	Object.defineProperty(exports, 'BaseComponent', {
	  enumerable: true,
	  get: function get() {
	    return _BaseComponentClass.BaseComponent;
	  }
	});

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var BaseComponent = exports.BaseComponent = function (_React$Component) {
	    _inherits(BaseComponent, _React$Component);

	    function BaseComponent(props) {
	        _classCallCheck(this, BaseComponent);

	        var _this = _possibleConstructorReturn(this, (BaseComponent.__proto__ || Object.getPrototypeOf(BaseComponent)).call(this, props));

	        var originComponentDidMount = _this.componentDidMount; // 接管子类方法
	        var originComponentWillUnmount = _this.componentWillUnmount; // 接管子类方法
	        _this.state = {};
	        _this._isMounted = false;
	        // 重定义子类componentDidMount
	        _this.componentDidMount = function () {
	            _this.superComponentDidMount();
	            if (typeof originComponentDidMount === 'function') {
	                originComponentDidMount.call(_this);
	            }
	        };
	        // 重定义子类componentWillUnmount
	        _this.componentWillUnmount = function () {
	            _this.superComponentWillUnmount();
	            if (typeof originComponentWillUnmount === 'function') {
	                originComponentWillUnmount.call(_this);
	            }
	        };
	        return _this;
	    }

	    /**
	     * 监听Store通用方法
	     * @param    {object}   store   Reflux之Store对象
	     */


	    _createClass(BaseComponent, [{
	        key: 'listenStore',
	        value: function listenStore(store) {
	            var _this2 = this;

	            store.listen(function (data) {
	                if (_this2.isMounted()) {
	                    _this2.setState(data);
	                }
	            });
	        }
	        // 基类DidMount方法

	    }, {
	        key: 'superComponentDidMount',
	        value: function superComponentDidMount() {
	            this._isMounted = true;
	        }
	        // 基类WillUnmount方法

	    }, {
	        key: 'superComponentWillUnmount',
	        value: function superComponentWillUnmount() {
	            this._isMounted = false;
	        }
	        // 判断组件是否已挂载

	    }, {
	        key: 'isMounted',
	        value: function isMounted() {
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
	    }]);

	    return BaseComponent;
	}(React.Component);

	;

/***/ }
/******/ ]);