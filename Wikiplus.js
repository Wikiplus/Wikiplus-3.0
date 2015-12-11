/**
 * Wikiplus-3.0 v0.0.1
 * 2015-12-12
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
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /* global mw */
/**
 * Wikiplus Core
 */

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Wikiplus = undefined;

var _i18n = require('./i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _version = require('./version');

var _util = require('./util');

var _ui = require('./ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wikiplus = exports.Wikiplus = (function () {
	//初始化

	function Wikiplus() {
		_classCallCheck(this, Wikiplus);

		console.log('Wikiplus-3.0 v' + _version.Version.VERSION);
		_util.Util.loadCss(_version.Version.scriptURL + "/Wikiplus.css");
		this.checkInstall();
	}
	//Load Moenotice

	_createClass(Wikiplus, [{
		key: 'setMoenotice',
		value: function setMoenotice(value) {
			this.moenotice = value;
		}
	}, {
		key: 'start',
		value: function start() {
			this.moenotice.create.success((0, _i18n2.default)("Test Run"));
		}
	}, {
		key: 'checkInstall',
		value: function checkInstall() {
			var self = this;
			var isInstall = _util.Util.getLocalConfig('isInstall');
			if (isInstall === "True") {
				//Updated Case
				if (_util.Util.getLocalConfig('Version') !== _version.Version.VERSION) {
					this.moenotice.create.success("Wikiplus-3.0 v" + _version.Version.VERSION);
					this.moenotice.create.success(_version.Version.releaseNote);
					_util.Util.setLocalConfig('Version', _version.Version.VERSION);
				}
			} else {
				(function () {
					//安装
					var install = function install() {
						_util.Util.setLocalConfig('isInstall', 'True');
						_util.Util.setLocalConfig('Version', _version.Version.VERSION);
						_util.Util.setLocalConfig('StartUseAt', new Date().valueOf());
						_util.Util.setLocalConfig('StartEditCount', mw.config.values.wgUserEditCount);
						self.moenotice.create.success((0, _i18n2.default)('Wikiplus installed, enjoy it'));
					};

					_ui.UI.createDialog({
						title: (0, _i18n2.default)('Install Wikiplus'),
						info: (0, _i18n2.default)('Do you allow WikiPlus to collect insensitive data to help us develop WikiPlus and improve suggestion to this site: $1 ?').replace(/\$1/ig, mw.config.values.wgSiteName)
					}).then(function (res) {
						console.log("用户选择：" + (res ? "接受" : "拒绝"));
						_util.Util.setLocalConfig('SendStatistics', res ? "True" : "False");
						install();
					});
				})();
			}
		}
	}]);

	return Wikiplus;
})();

},{"./i18n":2,"./ui":5,"./util":6,"./version":7}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = i18n;
/**
 * i18n for Wikiplus
 */
function i18n() {
  var value = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];

  return value;
}

},{}],3:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _moenotice = require('./moenotice');

/**
 * Wikiplus Main
 */

$(function () {
	var moenotice = new _moenotice.MoeNotification();
	var wikiplus = window.Wikiplus = new _core.Wikiplus();

	//依赖注入
	wikiplus.setMoenotice(moenotice);
	//主过程启动
	console.log('Wikiplus 开始加载');
	wikiplus.start();
});

},{"./core":1,"./moenotice":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        * Wikiplus UI Framework
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        */

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.UI = undefined;

var _i18n = require('./i18n');

var _i18n2 = _interopRequireDefault(_i18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UI = exports.UI = (function () {
	function UI() {
		_classCallCheck(this, UI);
	}

	_createClass(UI, null, [{
		key: 'createDialog',

		/**
   * 建立对话框
   * @param {String} option.info 信息
   * @param {String} option.title = "Wikiplus" 标题栏
   * @param {Object} option.mode 按钮标题和它的返回值，例子如下
   * mode: {
   *     "Yes": [true, "Yes"],
   *     "No": [false, "No"],
   *     "Key": [return value, "Display String"]
   * }
   */
		value: function createDialog(option) {
			var info = option.info || '';
			var title = option.title || (0, _i18n2.default)('Wikiplus');
			var mode = option.mode || { "Yes": [true, (0, _i18n2.default)("Yes")], "No": [false, (0, _i18n2.default)("No")] };

			return new Promise(function (resolve, reject) {
				var notice = $('<div>').text(info).attr('id', 'Wikiplus-InterBox-Content');
				var content = $('<div>').append(notice).append($('<hr>'));
				for (var btnKey in mode) {
					var dialogBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-InterBox-Btn' + btnKey).text(mode[btnKey][1]).data('value', mode[btnKey][0]);
					content.append(dialogBtn);
				}
				createBox({
					title: title,
					content: content,
					width: '600px',
					callback: function callback() {
						var _loop = function _loop(btnKey) {
							$('#Wikiplus-InterBox-Btn' + btnKey).click(function () {
								var resValue = $('#Wikiplus-InterBox-Btn' + btnKey).data('value');
								UI.closeAllBox();
								resolve(resValue);
							});
						};

						for (var btnKey in mode) {
							_loop(btnKey);
						}
					}
				});
			});
		}

		/**
   * 关闭所有Wikiplus弹出框
   */

	}, {
		key: 'closeAllBox',
		value: function closeAllBox() {
			$('.Wikiplus-InterBox').fadeOut('fast', function () {
				$(this).remove();
			});
		}
	}]);

	return UI;
})();

/**
 * 画框
 * @param {String} option.title 标题
 * @param {HTML} option.content 内容
 * @param {String} option.width = 600px 宽度
 * @param {function()} option.callback 回调函数
 */

function createBox(option) {
	var title = option.title || (0, _i18n2.default)("Wikiplus");
	var content = option.content || "";
	var width = option.title || "600px";
	var callback = option.callback || new Function();

	//检查是否已存在
	if ($('.Wikiplus-InterBox').length > 0) {
		$('.Wikiplus-InterBox').each(function () {
			$(this).remove();
		});
	}

	var clientWidth = document.body.clientWidth;
	var clientHeight = document.body.clientHeight;
	var diglogBox = $('<div>').addClass('Wikiplus-InterBox').css({
		'margin-left': clientWidth / 2 - width / 2,
		'top': $(document).scrollTop() + clientHeight * 0.2,
		'display': 'none'
	}).append($('<div>').addClass('Wikiplus-InterBox-Header').html(title)).append($('<div>').addClass('Wikiplus-InterBox-Content').append(content)).append($('<span>').text('×').addClass('Wikiplus-InterBox-Close'));
	$('body').append(diglogBox);
	$('.Wikiplus-InterBox').width(width);
	$('.Wikiplus-InterBox-Close').click(function () {
		$(this).parent().fadeOut('fast', function () {
			window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
			$(this).remove();
		});
	});
	//拖曳
	var bindDragging = function bindDragging(element) {
		element.mousedown(function (e) {
			var baseX = e.clientX;
			var baseY = e.clientY;
			var baseOffsetX = element.parent().offset().left;
			var baseOffsetY = element.parent().offset().top;
			$(document).mousemove(function (e) {
				element.parent().css({
					'margin-left': baseOffsetX + e.clientX - baseX,
					'top': baseOffsetY + e.clientY - baseY
				});
			});
			$(document).mouseup(function () {
				element.unbind('mousedown');
				$(document).unbind('mousemove');
				$(document).unbind('mouseup');
				bindDragging(element);
			});
		});
	};
	bindDragging($('.Wikiplus-InterBox-Header'));
	$('.Wikiplus-InterBox').fadeIn(500);
	callback();
}

},{"./i18n":2}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Wikiplus util library
 */

var Util = exports.Util = (function () {
	function Util() {
		_classCallCheck(this, Util);
	}

	_createClass(Util, null, [{
		key: "loadCss",

		//Load css (jQuery required)
		value: function loadCss(path) {
			$("head").append("<link>");
			$("head").children(":last").attr({
				rel: "stylesheet",
				type: "text/css",
				href: path
			});
		}
		//save local config

	}, {
		key: "setLocalConfig",
		value: function setLocalConfig(key, value) {
			var isObj = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

			key = "Wikiplus-" + key;
			if (isObj) {
				localStorage[key] = JSON.stringify(value);
			} else {
				localStorage[key] = value;
			}
		}
		//get local config

	}, {
		key: "getLocalConfig",
		value: function getLocalConfig(key) {
			var isObj = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			key = "Wikiplus-" + key;
			if (isObj) {
				return JSON.parse(localStorage[key]);
			} else {
				return localStorage[key];
			}
		}
	}]);

	return Util;
})();

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Wikiplus Version
 */

var Version = exports.Version = function Version() {
  _classCallCheck(this, Version);
};

;
Version.VERSION = "0.0.1";
Version.releaseNote = "正在构建Wikiplus-3.0";
Version.scriptURL = "https://127.0.0.1";

},{}]},{},[3]);
