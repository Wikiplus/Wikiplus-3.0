/**
 * Wikiplus v3.0.0
 * 2015-12-10
 * 
 * Author:Eridanus Sora
 * Github:https://github.com/Last-Order/Wikiplus
 *
 * Include MoeNotification
 * https://github.com/Last-Order/MoeNotification
 *
 * Copyright by Wikiplus, Eridanus Sora and other contributors
 * Licensed by Apache License 2.0
 * http://wikiplus-app.smartgslb.com/
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Wikiplus Core
 */

var Wikiplus = exports.Wikiplus = (function () {
	//初始化

	function Wikiplus() {
		_classCallCheck(this, Wikiplus);
	}
	//moenotice

	_createClass(Wikiplus, [{
		key: "setMoenotice",
		value: function setMoenotice(value) {
			this.moenotice = value;
		}
	}, {
		key: "start",
		value: function start() {
			this.moenotice.create.success("Test Run");
		}
	}]);

	return Wikiplus;
})();

},{}],2:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _moenotice = require('./moenotice');

/**
 * Wikiplus Main
 */

$(function () {
	var moenotice = new _moenotice.MoeNotification();
	var wikiplus = window.Wikiplus = new _core.Wikiplus();
	console.log('Wikiplus 开始加载');

	//依赖注入
	wikiplus.setMoenotice(moenotice);
	//主过程启动
	wikiplus.start();
});

},{"./core":1,"./moenotice":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MoeNotification = MoeNotification;
/**
 * MoeNotification mini
 */
function MoeNotification() {
    var self = this;
    this.display = function (text, type, callback) {
        var _callback = callback || function () {};
        var _text = text || '喵~';
        var _type = type || 'success';
        $("#MoeNotification").append($("<div>").addClass('MoeNotification-notice').addClass('MoeNotification-notice-' + _type).append('<span>' + _text + '</span>').fadeIn(300));
        self.bind();
        self.clear();
        _callback($("#MoeNotification").find('.MoeNotification-notice').last());
    };
    this.create = {
        success: function success(text, callback) {
            var _callback = callback || function () {};
            self.display(text, 'success', _callback);
        },
        warning: function warning(text, callback) {
            var _callback = callback || function () {};
            self.display(text, 'warning', _callback);
        },
        error: function error(text, callback) {
            var _callback = callback || function () {};
            self.display(text, 'error', _callback);
        }
    };
    this.clear = function () {
        if ($(".MoeNotification-notice").length >= 10) {
            $("#MoeNotification").children().first().fadeOut(150, function () {
                $(this).remove();
            });
            setTimeout(self.clear, 300);
        } else {
            return false;
        }
    };
    this.empty = function (f) {
        $(".MoeNotification-notice").each(function (i) {
            if ($.isFunction(f)) {
                var object = this;
                setTimeout(function () {
                    f($(object));
                }, 200 * i);
            } else {
                $(this).delay(i * 200).fadeOut('fast', function () {
                    $(this).remove();
                });
            }
        });
    };
    this.bind = function () {
        $(".MoeNotification-notice").mouseover(function () {
            self.slideLeft($(this));
        });
    };
    window.slideLeft = this.slideLeft = function (object, speed) {
        object.css('position', 'relative');
        object.animate({
            left: "-200%"
        }, speed || 150, function () {
            $(this).fadeOut('fast', function () {
                $(this).remove();
            });
        });
    };
    this.init = function () {
        $("body").append('<div id="MoeNotification"></div>');
    };
    if (!($("#MoeNotification").length > 0)) {
        this.init();
    }
}

},{}]},{},[2]);
