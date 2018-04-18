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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(12);


/***/ },

/***/ 12:
/***/ function(module, exports) {

	"use strict";

	//确保jquery已经被引入index.html中


	//css扩展

	/**
	 * 算出各个类中css属性的差值，只能传入类名，和以长度为单位的属性，最少传入4个参数
	 * @param  {[type]} args 类名和css属性
	 * @return {[type]}      做差后所得到的值
	 */
	$.lengthSub = function () {
	    if (arguments.length < 4 || arguments.length % 2 != 0) {
	        console.log("input params error");
	        return '0px';
	    }
	    var value = parseInt(getAttribute(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]));

	    for (var i = 2; i < arguments.length;) {
	        var sub = parseInt(getAttribute(arguments.length <= i + 0 ? undefined : arguments[i + 0], arguments.length <= i + 1 + 0 ? undefined : arguments[i + 1 + 0]));
	        value -= sub;
	        i += 2;
	    }
	    return value + "px";
	};

	function getAttribute(className, attribute) {
	    return $("." + className).css(attribute);
	}

	$.lengthAdd = function () {
	    if (arguments.length < 4 || arguments.length % 2 != 0) {
	        console.log("input params error");
	        return '0px';
	    }
	    var sum = parseInt(getAttribute(arguments.length <= 0 ? undefined : arguments[0], arguments.length <= 1 ? undefined : arguments[1]));

	    for (var i = 2; i < arguments.length;) {
	        var value = parseInt(getAttribute(arguments.length <= i + 0 ? undefined : arguments[i + 0], arguments.length <= i + 1 + 0 ? undefined : arguments[i + 1 + 0]));
	        sum += value;
	        i += 2;
	    }
	    return sum + "px";
	};

	$.parseIntInvalidToZero = function (ele) {
	    var value = parseInt(ele);
	    value = isNaN(value) ? 0 : value;
	    return value;
	};

	$.parseIntInvalidToNegativeOne = function (ele) {
	    var value = parseInt(ele);
	    value = isNaN(value) ? -1 : value;
	    return value;
	};

	String.prototype.toTwoHex = function () {
	    var value = $.parseIntInvalidToZero(this);
	    var hex = value.toString(16);
	    if (hex.length == 1) {
	        return "0" + hex;
	    } else {
	        return hex.slice(-2);
	    }
	};

	console.log("xxxx");

	Number.prototype.toTwoHex = function () {
	    var value = $.parseIntInvalidToZero(this);
	    var hex = value.toString(16);
	    if (hex.length == 1) {
	        return "0" + hex;
	    } else {
	        return hex.slice(-2);
	    }
	};

/***/ }

/******/ });