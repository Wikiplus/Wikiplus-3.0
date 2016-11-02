/**
 * Wikiplus-3.0 v0.0.5
 * 2016-11-01
 * 
 * Github:https://github.com/Wikiplus/Wikiplus-3.0
 *
 * Include MoeNotification
 * https://github.com/Wikiplus/MoeNotification
 *
 * Copyright by Wikiplus, Eridanus Sora, Ted Zyzsdy and other contributors
 * Licensed under Apache License 2.0
 * http://wikiplus-app.smartgslb.com/
 */
 
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Wikipage = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Wikipage
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * MediaWiki Front-end SDK
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _api = require('./api');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wikipage = exports.Wikipage = function () {
    /**
     * 构造函数
     * @param {string} title 页面标题
     */
    function Wikipage() {
        var _this = this;

        var title = arguments.length <= 0 || arguments[0] === undefined ? window.mw.config.values.wgPageName : arguments[0];

        _classCallCheck(this, Wikipage);

        this.title = title;
        // 查询本页面基础信息
        this.info = Promise.all([_api.API.getEditToken(title), _api.API.getTimeStamp(title)]).then(function (data) {
            _this.editToken = data[0];
            _this.timeStamp = data[1];
            console.log('获取页面' + title + '信息成功');
        }).catch(function (e) {
            console.error('获取页面基础信息失败：', e);
        });
        this.wikiTextCache = {}; // WikiText缓存
        this.lastestRevision = window.mw.config.values.wgCurRevisionId;
    }

    /**
     * 重定向至
     * @param {string} target 目标页面
     */


    _createClass(Wikipage, [{
        key: 'redirectTo',
        value: function redirectTo(target) {
            var _this2 = this;

            this.info = this.info.then(function () {
                _api.API.redirectTo(target, _this2.editToken);
            });
        }

        /**
         * 重定向从
         * @param {string} origin 源页面
         */

    }, {
        key: 'redirectFrom',
        value: function redirectFrom(origin) {
            var _this3 = this;

            this.info = this.info.then(function () {
                _api.API.redirectFrom(origin, _this3.editToken);
            });
        }

        /**
         * 修改页面内容
         * @param {string} content
         * @param {object} config
         * @returns {Promise}
         */

    }, {
        key: 'setContent',
        value: function setContent(content) {
            var _this4 = this;

            var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return new Promise(function (res, rej) {
                _this4.info = _this4.info.then(function () {
                    _api.API.edit($.extend({
                        "title": _this4.title,
                        "token": _this4.editToken,
                        "basetimestamp": _this4.timeStamp,
                        "text": content
                    }, config)).then(function (data) {
                        res(data);
                    }).catch(function (e) {
                        rej(e);
                    });
                });
            });
        }

        /**
         * 获得当前页面的WikiText
         * @param {string} section
         * @param {string} revision (可选)修订版本
         */

    }, {
        key: 'getWikiText',
        value: function getWikiText() {
            var _this5 = this;

            var section = arguments.length <= 0 || arguments[0] === undefined ? 'page' : arguments[0];
            var revision = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

            // page是一个不合法的参数值 但是MediaWiki会忽略不合法的参数值 等价于获取全页
            return new Promise(function (res, rej) {
                if (revision) {
                    if (_this5.wikiTextCache[revision + '#' + section]) {
                        res(_this5.wikiTextCache[revision + '#' + section]);
                    } else {
                        _this5.info = _this5.info.then(function () {
                            _api.API.getWikiText(_this5.title, section, revision).then(function (wikiText) {
                                _this5.wikiTextCache[revision + '#' + section] = wikiText;
                                res(wikiText);
                            }).catch(rej);
                        });
                    }
                } else {
                    if (_this5.wikiTextCache['' + section]) {
                        res(_this5.wikiTextCache['' + section]);
                    } else {
                        _this5.info = _this5.info.then(function () {
                            _api.API.getWikiText(_this5.title, section).then(function (wikiText) {
                                _this5.wikiTextCache['' + section] = wikiText;
                                res(wikiText);
                            });
                        });
                    }
                }
            });
        }

        /**
         * 解析页面文本
         * @param wikiText
         * @param pageName
         * @returns {Promise}
         */

    }, {
        key: 'parseWikiText',
        value: function parseWikiText() {
            var _this6 = this;

            var wikiText = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
            var pageName = arguments.length <= 1 || arguments[1] === undefined ? this.title : arguments[1];

            return new Promise(function (res, rej) {
                _this6.info = _this6.info.then(function () {
                    _api.API.parseWikiText(wikiText, _this6.title).then(res).catch(rej);
                });
            });
        }
    }]);

    return Wikipage;
}();

},{"./api":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.API = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Mediawiki API Wrapper
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _i18n = require('./i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _version = require('./version');

var _log = require('./log');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = new _log.Log();

var API = exports.API = function () {
    function API() {
        _classCallCheck(this, API);
    }
    /**
     * 返回API地址
     * @return {string} API API地址
     */


    _createClass(API, null, [{
        key: 'getAPIURL',
        value: function getAPIURL() {
            return location.protocol + '//' + location.host + window.mw.config.values.wgScriptPath + '/api.php';
        }

        /**
         * 返回当前页页面名。
         * @return {string} pageName 页面标题
         */

    }, {
        key: 'getThisPageName',
        value: function getThisPageName() {
            var pageName = window.mw.config.values.wgPageName;
            if (pageName === undefined) {
                throw new Error("Fail to get the title of this page."); // 这错误也能触发 运气很好
            } else {
                return pageName;
            }
        }

        /**
         * 返回当前的用户名
         * @return {string} username 当前登录用户名
         */

    }, {
        key: 'getUsername',
        value: function getUsername() {
            var getUserId = window.mw.user.id;
            if (getUserId === undefined) {
                throw new Error("Fail to get the title of this page."); // 这错误也能触发 运气很好
            } else {
                return getUserId();
            }
        }

        /**
         * 返回编辑令牌
         * @return Promise
         */

    }, {
        key: 'getEditToken',
        value: function getEditToken(title) {
            var self = this;
            return new Promise(function (resolve, reject) {
                if (window.mw.user.tokens.get('editToken') && window.mw.user.tokens.get('editToken') !== '+\\') {
                    resolve(window.mw.user.tokens.get('editToken'));
                } else {
                    // 前端拿不到edittoken 通过API取
                    $.ajax({
                        url: self.API,
                        type: "GET",
                        dataType: "json",
                        data: {
                            'action': 'query',
                            'meta': 'tokens',
                            'format': 'json'
                        },
                        success: function success(data) {
                            if (data.query && data.query.tokens && data.query.tokens.csrftoken && data.query.tokens.csrftoken !== '+\\') {
                                resolve(data.query.tokens.csrftoken);
                            } else {
                                Logger.error('fail_to_get_edittoken');
                                reject((0, _i18n2.default)('fail_to_get_edittoken'));
                            }
                        },
                        error: function error(e) {
                            Logger.error('fail_to_get_edittoken');
                            reject((0, _i18n2.default)('fail_to_get_edittoken'));
                        }
                    });
                }
            });
        }

        /**
         * 获取编辑起始时间戳
         * @param {string} title 页面标题
         * @return Promise
         */

    }, {
        key: 'getTimeStamp',
        value: function getTimeStamp(title) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: _this.getAPIURL(),
                    type: "GET",
                    dataType: "json",
                    data: {
                        'action': 'query',
                        'prop': 'revisions|info',
                        'titles': title,
                        'rvprop': 'timestamp',
                        'format': 'json'
                    },
                    beforeSend: function beforeSend() {
                        console.time('获得页面基础信息时间耗时');
                    },
                    success: function success(data) {
                        if (data && data.query && data.query.pages) {
                            var info = data.query.pages;
                            for (var key in info) {
                                if (key !== '-1') {
                                    if (info[key].revisions && info[key].revisions.length > 0) {
                                        resolve(info[key].revisions[0].timestamp);
                                        console.timeEnd('获得页面基础信息时间耗时');
                                    } else {
                                        reject(new Error('Fail to get the timestamp of this page.'));
                                        console.timeEnd('获得页面基础信息时间耗时');
                                    }
                                } else {
                                    if (info[-1]['missing'] !== undefined) {
                                        console.info("页面未建立。");
                                        resolve(undefined);
                                        console.timeEnd('获得页面基础信息时间耗时');
                                    } else {
                                        reject(new Error("Can't get timestamps of special pages."));
                                        console.timeEnd('获得页面基础信息时间耗时');
                                    }
                                    //暂时废弃的写法
                                    //if (window.mw.config.values.wgArticleId === 0) {
                                    //    reject(new Error("Can't get timestamps of empty pages."));
                                    //}
                                }
                            }
                        } else {
                            reject(new Error('Return result is invaild.'));
                            console.timeEnd('获得页面基础信息时间耗时');
                        }
                    },
                    error: function error(e) {
                        reject(new Error('Fail to get the timestamp of this page.'));
                        console.timeEnd('获得页面基础信息时间耗时');
                    }
                });
            });
        }

        /**
         * 页面编辑
         * @param {object} config
         */

    }, {
        key: 'edit',
        value: function edit() {
            var _this2 = this;

            var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var self = this;
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: _this2.getAPIURL(),
                    data: $.extend({
                        'action': 'edit',
                        'format': 'json'
                    }, config),
                    success: function success(data) {
                        if (data && data.edit) {
                            if (data.edit.result && data.edit.result == 'Success') {
                                resolve(data.edit);
                            } else {
                                if (data.edit.code) {
                                    //防滥用过滤器
                                    Logger.error('hit_abusefilter');
                                    reject((0, _i18n2.default)('hit_abusefilter') + ':' + data.edit.info.replace('/Hit AbuseFilter: /ig', '') + '<br><small>' + data.edit.warning + '</small>');
                                } else {
                                    Logger.error('unknown_edit_error');
                                    reject((0, _i18n2.default)('unknown_edit_error'));
                                }
                            }
                        } else if (data && data.error && data.error.code) {
                            var errorInfo = {
                                'protectedtitle': (0, _i18n2.default)('protectedtitle'),
                                'cantcreate': (0, _i18n2.default)('cantcreate'),
                                'spamdetected': (0, _i18n2.default)('spamdetected'),
                                'contenttoobig': (0, _i18n2.default)('contenttoobig'),
                                'noedit': (0, _i18n2.default)('noedit'),
                                'pagedeleted': (0, _i18n2.default)('pagedeleted'),
                                'editconflict': (0, _i18n2.default)('editconflict'),
                                'badtoken': (0, _i18n2.default)('badtoken'),
                                'notoken': (0, _i18n2.default)('notoken'),
                                'invalidtitle': (0, _i18n2.default)('invalidtitle'),
                                'summaryrequired': (0, _i18n2.default)('summaryrequired'),
                                'customcssprotected': (0, _i18n2.default)('customcssprotected'),
                                'customjsprotected': (0, _i18n2.default)('customjsprotected'),
                                'cascadeprotected': (0, _i18n2.default)('cascadeprotected'),
                                'blocked': (0, _i18n2.default)('blocked'),
                                'ratelimited': (0, _i18n2.default)('ratelimited')
                            }[data.error.code] || (0, _i18n2.default)('common_edit_error').replace(/\$1/ig, data.error.code);
                            Logger.error(data.error.code);
                            reject(errorInfo);
                        } else if (data.code) {
                            Logger.error(data.code);
                            reject((0, _i18n2.default)(data.code));
                        } else {
                            Logger.error('unknown_edit_error');
                            reject((0, _i18n2.default)('unknown_edit_error'));
                        }
                    },
                    error: function error(e) {
                        Logger.error('network_edit_error');
                        reject((0, _i18n2.default)('network_edit_error'));
                    }
                });
            });
        }

        /**
         * 重定向至
         * @param {string} target 目标页面
         * @param {string} editToken 编辑令牌
         * @param {object} config 自定义设置
         */

    }, {
        key: 'redirectTo',
        value: function redirectTo(target, editToken, config) {
            return this.edit($.extend({
                "title": window.mw.config.values.wgPageName,
                "text": '#REDIRECT [[' + target + ']]',
                "token": editToken,
                "summary": (0, _i18n2.default)('Redirect [[' + window.mw.config.values.wgPageName + ']] to [[' + target + ']] via Wikiplus')
            }, config));
        }

        /**
         * 重定向从
         * @param {string} origin 源页面
         * @param {string} editToken 编辑令牌
         * @param {object} config 自定义设置
         */

    }, {
        key: 'redirectFrom',
        value: function redirectFrom(origin, editToken, config) {
            return this.edit($.extend({
                "title": origin,
                "text": '#REDIRECT [[' + window.mw.config.values.wgPageName + ']]',
                "token": editToken,
                "summary": (0, _i18n2.default)('Redirect [[' + origin + ']] to [[' + window.mw.config.values.wgPageName + ']] via Wikiplus')
            }, config));
        }

        /**
         * 获取页面WikiText
         * @param {string} title 页面名
         * @param {string} section 段落编号(可选)
         * @param {string} revision 修订版本号(可选)
         * @return Promise
         */

    }, {
        key: 'getWikiText',
        value: function getWikiText(title) {
            var section = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
            var revision = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: location.protocol + '//' + location.host + window.mw.config.values.wgScriptPath + '/index.php',
                    type: "GET",
                    dataType: "text",
                    cache: false,
                    data: {
                        "title": title,
                        "action": 'raw',
                        "oldid": revision,
                        "section": section
                    },
                    beforeSend: function beforeSend() {
                        console.time('获得页面文本耗时');
                    },
                    success: function success(data) {
                        resolve(data);
                        console.timeEnd('获得页面文本耗时');
                    },
                    error: function error(e) {
                        if (e.status === 404) {
                            // 大可能是空页面
                            resolve((0, _i18n2.default)('create_page_tip'));
                        }
                        reject(new Error('Fail to get the WikiText of this page.'));
                    }
                });
            });
        }

        /**
         * 解析WikiText
         * @param {string} wikitext
         * @param pageName
         */

    }, {
        key: 'parseWikiText',
        value: function parseWikiText() {
            var _this3 = this;

            var wikitext = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
            var pageName = arguments.length <= 1 || arguments[1] === undefined ? this.getThisPageName() : arguments[1];

            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        'format': 'json',
                        'action': 'parse',
                        'text': wikitext,
                        'title': pageName,
                        'pst': 'true'
                    },
                    url: _this3.getAPIURL(),
                    success: function success(data) {
                        if (data && data.parse && data.parse.text) {
                            resolve(data.parse.text['*']);
                        } else {
                            reject(new Error('Fail to parse WikiText.'));
                        }
                    },
                    error: function error(e) {
                        reject(new Error('Fail to parse WikiText due to network reasons.'));
                    }
                });
            });
        }
    }]);

    return API;
}();

},{"./i18n":4,"./log":5,"./version":11}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Wikiplus = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global mw */
/**
 * Wikiplus Core
 */


var _i18n = require('./i18n');

var _i18n2 = _interopRequireDefault(_i18n);

var _version = require('./version');

var _util = require('./util');

var _ui = require('./ui');

var _moduleManager = require('./moduleManager');

var _api = require('./api');

var _Wikipage = require('./Wikipage');

var _log = require('./log');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wikiplus = exports.Wikiplus = function () {
    //初始化
    function Wikiplus(notice) {
        _classCallCheck(this, Wikiplus);

        this.UI = _ui.UI;
        this.Util = _util.Util;
        this.Version = _version.Version;
        this.notice = notice;
        this.API = _api.API;
        this.Wikipage = new _Wikipage.Wikipage();
        this.coreConfig = new CoreConfig(this.notice);
        this.Log = new _log.Log();

        console.log('Wikiplus-3.0 v' + _version.Version.VERSION);
        _util.Util.scopeConfigInit();
        _util.Util.loadCss(_version.Version.scriptURL + "/Wikiplus.css");
    }

    _createClass(Wikiplus, [{
        key: 'start',
        value: function start() {
            //检查更新
            this.checkInstall();
            //载入模块
            this.mmr = new _moduleManager.ModuleManager();
            this.loadCoreFunctions();
        }
    }, {
        key: 'checkInstall',
        value: function checkInstall() {
            var _this = this;

            var self = this;
            var isInstall = this.coreConfig.isInstall;
            if (isInstall === "True") {
                //加载并初始化i18n
                var i18n = new _i18n.I18n(this.coreConfig.language);
                i18n.initI18n();
                //Updated Case
                if (this.coreConfig.Version !== _version.Version.VERSION) {
                    this.notice.create.success("Wikiplus-3.0 v" + _version.Version.VERSION);
                    this.notice.create.success(_version.Version.releaseNote);
                    this.coreConfig.Version = _version.Version.VERSION;
                    //检查语言更新
                    i18n.load();
                }
            } else {
                (function () {
                    //首次加载并初始化i18n（使用系统语言）
                    var i18n = new _i18n.I18n(window.navigator.language.toLowerCase(), false);
                    i18n.initI18n();
                    //安装
                    var install = function install() {
                        self.coreConfig.isInstall = 'True';
                        self.coreConfig.Version = _version.Version.VERSION;
                        self.coreConfig.StartUseAt = '' + new Date().valueOf();
                        self.coreConfig.StartEditCount = mw.config.values.wgUserEditCount;
                        self.coreConfig.language = window.navigator.language.toLowerCase();
                        self.notice.create.success((0, _i18n2.default)('Wikiplus installed, enjoy it'));
                    };

                    _this.coreConfig.loadConfigHelper().then(function (data) {
                        delete data["updatetime"];
                        _this.coreConfig.saveConfigToLocal(data);
                        install();
                    }).catch(function (err) {
                        _ui.UI.createDialog({
                            title: (0, _i18n2.default)('Install Wikiplus'),
                            info: (0, _i18n2.default)('Do you allow WikiPlus to collect insensitive data to help us develop WikiPlus and improve suggestion to this site: $1 ?').seti18n(mw.config.values.wgSiteName),
                            mode: [{ id: "Yes", text: (0, _i18n2.default)("Yes"), res: true }, { id: "No", text: (0, _i18n2.default)("No"), res: false }]
                        }).then(function (res) {
                            console.log("用户选择：" + (res ? "接受" : "拒绝"));
                            _this.coreConfig.SendStatistics = res ? "True" : "False";
                            install();
                        });
                    });
                })();
            }
        }

        /**
         * 初始化快速编辑
         */

    }, {
        key: 'initQuickEdit',
        value: function initQuickEdit() {
            // 分析网页链接
            if (!(mw.config.values.wgIsArticle && mw.config.values.wgAction === "view" && mw.config.values.wgIsProbablyEditable)) {
                console.log('该页面无法编辑 快速编辑界面加载终止');
                return false;
            }
            this.generateQuickEditButtons();
        }

        /**
         * 生成快速编辑按钮
         */

    }, {
        key: 'generateQuickEditButtons',
        value: function generateQuickEditButtons() {
            // 顶部按钮
            var self = this;
            var topBtn = $('<li>').attr('id', 'Wikiplus-Edit-TopBtn').append($('<span>').append($('<a>').attr('href', 'javascript:void(0)').text('' + (0, _i18n2.default)('QuickEdit')))).data({
                sectionNumber: 'page',
                target: this.API.getThisPageName(),
                revision: window.mw.config.values.wgRevisionId
            }).addClass('Wikiplus-QuickEdit-Entrance');

            if ($('#ca-edit').length > 0 && $('#Wikiplus-Edit-TopBtn').length == 0) {
                $('#ca-edit').before(topBtn);
            }

            // 段落按钮
            if ($('.mw-editsection').length > 0) {
                //段落快速编辑按钮
                var sectionBtn = $('<span>').append($('<span>').attr('id', 'mw-editsection-bracket').text('[')).append($('<a>').addClass('Wikiplus-Edit-SectionBtn').attr('href', 'javascript:void(0)').text((0, _i18n2.default)('QuickEdit'))).append($('<span>').attr('id', 'mw-editsection-bracket').text(']'));
                $('.mw-editsection').each(function (i) {
                    try {
                        var editURL = $(this).find("a").last().attr('href');
                        // Attention: RegExp Magic. DO NOT MODIFY UNLESS YOU HAVE THOUGHT CAREFULLY.
                        // 注意：此处的正则表达式经过了长期的实践检验，请不要轻易更改除非你已经深思熟虑。
                        var sectionNumber = editURL.match(/&[ve]*section\=([^&]+)/)[1].replace(/T-/ig, '');
                        var sectionTargetName = decodeURI(editURL.match(/title=(.+?)&/)[1]);

                        var cloneNode = $(this).prev().clone();
                        cloneNode.find('.mw-headline-number').remove();
                        var sectionName = $.trim(cloneNode.text());
                        var _sectionBtn = sectionBtn.clone();
                        _sectionBtn.find('.Wikiplus-Edit-SectionBtn').data({
                            sectionNumber: sectionNumber,
                            sectionName: sectionName,
                            target: sectionTargetName,
                            revision: window.mw.config.values.wgRevisionId
                        }).addClass('Wikiplus-QuickEdit-Entrance');
                        $(this).append(_sectionBtn);
                    } catch (e) {
                        self.Log.error('fail_to_init_quickedit');
                    }
                });
            }

            this.bindQuickEditEvents();
        }

        /**
         * 绑定QuickEdit入口事件
         */

    }, {
        key: 'bindQuickEditEvents',
        value: function bindQuickEditEvents() {
            var self = this;
            $('.Wikiplus-QuickEdit-Entrance').click(function () {
                var editSetting = $(this).data();
                var page = self.Wikipage;
                if (editSetting.target !== self.API.getThisPageName()) {
                    // 编辑目标并不是本页面
                    page = new _Wikipage.Wikipage(editSetting.target);
                }
                self.notice.create.success((0, _i18n2.default)('loading'));
                page.getWikiText(editSetting.sectionNumber, editSetting.revision).then(function (wikiText) {
                    self.notice.empty();
                    var UISettings = {
                        "content": wikiText,
                        "page": page,
                        "sectionName": editSetting.sectionName,
                        "sectionNumber": editSetting.sectionNumber
                    };
                    if (editSetting.revision !== window.mw.config.values.wgCurRevisionId) {
                        UISettings.title = (0, _i18n2.default)('QuickEdit') + ' // ' + (0, _i18n2.default)('history_edit_warning');
                    }
                    if (editSetting.sectionName) {
                        UISettings.summary = '/* ' + editSetting.sectionName + ' */ ' + (0, _i18n2.default)('default_summary');
                    }
                    self.generateQuickEditUI(UISettings);
                }).catch(function () {
                    self.notice.error((0, _i18n2.default)('load_wikitext_failed'));
                });
            });
        }

        /**
         * 向页面插入Wikiplus快速编辑界面
         */

    }, {
        key: 'generateQuickEditUI',
        value: function generateQuickEditUI() {
            var _this2 = this;

            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var title = options.title || (0, _i18n2.default)('QuickEdit');
            var summary = options.summary || (0, _i18n2.default)('default_summary');
            var content = options.content || '';

            var backBtn = $('<span>').attr('id', 'Wikiplus-Quickedit-Back').addClass('Wikiplus-Btn').text('' + (0, _i18n2.default)('back')); //返回按钮
            var jumpBtn = $('<span>').attr('id', 'Wikiplus-Quickedit-Jump').addClass('Wikiplus-Btn').append($('<a>').attr('href', '#Wikiplus-Quickedit').text('' + (0, _i18n2.default)('goto_editbox'))); //到编辑框
            var inputBox = $('<textarea>').attr('id', 'Wikiplus-Quickedit').val(content); //主编辑框
            var previewBox = $('<div>').attr('id', 'Wikiplus-Quickedit-Preview-Output'); //预览输出
            var summaryBox = $('<input>').attr('id', 'Wikiplus-Quickedit-Summary-Input').attr('placeholder', '' + (0, _i18n2.default)('summary_placeholder')).val(summary); //编辑摘要输入
            var editSubmitBtn = $('<button>').attr('id', 'Wikiplus-Quickedit-Submit').text((0, _i18n2.default)('submit') + '(Ctrl+S)'); //提交按钮
            var previewSubmitBtn = $('<button>').attr('id', 'Wikiplus-Quickedit-Preview-Submit').text('' + (0, _i18n2.default)('preview')); //预览按钮
            var isMinorEdit = $('<div>').append($('<input>').attr({ 'type': 'checkbox', 'id': 'Wikiplus-Quickedit-MinorEdit' })).append($('<label>').attr('for', 'Wikiplus-Quickedit-MinorEdit').text((0, _i18n2.default)('mark_minoredit') + '(Ctrl+Shift+S)')).css({ 'margin': '5px 5px 5px -3px', 'display': 'inline' });
            //DOM定义结束
            var editBody = $('<div>').append(backBtn, jumpBtn, previewBox, inputBox, summaryBox, $('<br>'), isMinorEdit, editSubmitBtn, previewSubmitBtn);

            this.UI.createBox({
                "title": title,
                "content": editBody,
                "width": 1000,
                "callback": function callback() {
                    // 绑定界面事件
                    var heightBefore = $(document).scrollTop();
                    var outputArea = $('#Wikiplus-Quickedit-Preview-Output');
                    var self = _this2;

                    // 返回按钮 等同关闭
                    $("#Wikiplus-Quickedit-Back").click(function () {
                        $(".Wikiplus-InterBox-Close").click();
                    });

                    // 预览
                    var onPreload = $('<div>').addClass('Wikiplus-Banner').text('' + (0, _i18n2.default)('loading_preview'));
                    $('#Wikiplus-Quickedit-Preview-Submit').click(function () {
                        var wikiText = $('#Wikiplus-Quickedit').val();
                        $(this).attr('disabled', 'disabled');
                        outputArea.fadeOut(100, function () {
                            outputArea.html('').append(onPreload).fadeIn(100);
                        });
                        $('body').animate({ scrollTop: heightBefore }, 200); //返回顶部

                        self.Wikipage.parseWikiText(wikiText).then(function (html) {
                            outputArea.fadeOut(100, function () {
                                // 预览区域须有一个mw-body-content包裹 这样可以引用mw的一些默认样式
                                outputArea.html('<hr><div class="mw-body-content">' + html + '</div>').fadeIn(100);
                                $('#Wikiplus-Quickedit-Preview-Submit').removeAttr('disabled');
                            });
                        });
                    });

                    // 提交
                    $('#Wikiplus-Quickedit-Submit').click(function () {
                        var wikiText = $('#Wikiplus-Quickedit').val();
                        var summary = $('#Wikiplus-Quickedit-Summary-Input').val();
                        var timer = new Date().valueOf();
                        var onEdit = $('<div>').addClass('Wikiplus-Banner').text('' + (0, _i18n2.default)('submitting_edit'));

                        var additionalConfig = {
                            'summary': summary
                        };
                        if (options.sectionNumber !== 'page') {
                            additionalConfig['section'] = options.sectionNumber;
                        }
                        if ($('#Wikiplus-Quickedit-MinorEdit').is(':checked')) {
                            additionalConfig['minor'] = 'true';
                        }
                        // 准备编辑
                        $('#Wikiplus-Quickedit-Submit,#Wikiplus-Quickedit,#Wikiplus-Quickedit-Preview-Submit').attr('disabled', 'disabled');
                        $('body').animate({ scrollTop: heightBefore }, 200);

                        // 关闭网页确认
                        $('#Wikiplus-Quickedit').keydown(function () {
                            window.onclose = window.onbeforeunload = function () {
                                return '' + (0, _i18n2.default)('onclose_confirm');
                            };
                        });

                        outputArea.fadeOut(100, function () {
                            outputArea.html('').append(onEdit).fadeIn(100);
                        });

                        options.page.setContent(wikiText, additionalConfig).then(function () {
                            outputArea.fadeOut(100, function () {
                                outputArea.find('.Wikiplus-Banner').css('background', 'rgba(6, 239, 92, 0.44)');
                                outputArea.find('.Wikiplus-Banner').html((0, _i18n2.default)('Edit submitted'));
                                outputArea.fadeIn(100);
                            });
                            window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                            setTimeout(function () {
                                location.reload();
                            }, 500);
                        }).catch(function (e) {
                            outputArea.fadeOut(100, function () {
                                outputArea.find('.Wikiplus-Banner').css('background', 'rgba(218, 142, 167, 0.65)');
                                outputArea.find('.Wikiplus-Banner').html(e);
                                outputArea.fadeIn(100);
                            });
                            $('#Wikiplus-Quickedit-Submit,#Wikiplus-Quickedit,#Wikiplus-Quickedit-Preview-Submit').removeAttr('disabled');
                        });
                    });
                }
            });
        }
    }, {
        key: 'loadCoreFunctions',
        value: function loadCoreFunctions() {
            this.coreConfig.init();
            this.initQuickEdit();
        }
    }]);

    return Wikiplus;
}();

var CoreConfig = function () {
    function CoreConfig(notice) {
        _classCallCheck(this, CoreConfig);

        this.notice = notice;
    }

    _createClass(CoreConfig, [{
        key: 'init',
        value: function init() {
            var _this3 = this;

            _ui.UI.addLinkInToolbox({
                name: (0, _i18n2.default)("Wikiplus Config"),
                title: (0, _i18n2.default)("Configurations for global Wikiplus."),
                callback: function callback() {
                    _this3.drawConfigBox();
                }
            });
        }
    }, {
        key: 'drawConfigBox',
        value: function drawConfigBox() {
            var _this4 = this;

            var boxContent = $('<div id="wikiplus-config-area"><p>' + (0, _i18n2.default)("You could change Wikiplus settings here. These settings will work on the whole Wiki.") + '</p><br></div>');

            //语言设置
            var languageInput = $('<input type="text" id="wikiplus-config-it-language">').val(_util.Util.getLocalConfig("language"));
            boxContent.append($('<p><b>' + (0, _i18n2.default)("Language") + '</b>: </p>').append(languageInput));

            //是否发送统计信息
            var statInput = $('<label><input type="radio" id="wikiplus-config-ir-stat" value="true" name="wikiplus-config-stat">' + (0, _i18n2.default)("Allow") + '</label>');
            var noStatInput = $('<label><input name="wikiplus-config-stat" value="false" type="radio" id="wikiplus-config-ir-nostat">' + (0, _i18n2.default)("Disallow") + '</label>');
            if (_util.Util.getLocalConfig("SendStatistics") == "True") {
                statInput.find("input")[0].checked = true;
                noStatInput.find("input")[0].checked = false;
            } else {
                statInput.find("input")[0].checked = false;
                noStatInput.find("input")[0].checked = true;
            }
            boxContent.append($('<p><b>' + (0, _i18n2.default)("Send Statistics") + '</b>: </p>').append(statInput).append(noStatInput));

            //需载入的模块
            var modulesConfig = _util.Util.getLocalConfig("modules", true);
            if (modulesConfig === undefined) {
                modulesConfig = [];
            }
            var modulesInput = $('<textarea id="wikiplus-config-it-modules"></textarea>').val(modulesConfig.join(", "));
            boxContent.append($('<p><b>' + (0, _i18n2.default)("Loaded Modules") + '</b>:<br>' + (0, _i18n2.default)("Type comma-separated module names here.") + '</p>').append(modulesInput));

            //从服务器恢复设置
            var loadConfigBtn = $('<input type="button" id="wikiplus-config-btn-loadconfig" value="' + (0, _i18n2.default)("Load Config") + '">');
            loadConfigBtn.click(function () {
                _this4.notice.create.success((0, _i18n2.default)("Checking if had configuration on this wiki."));
                _this4.loadConfig();
            });
            boxContent.append($("<hr>")).append($('<p><b>' + (0, _i18n2.default)("Load Config from server") + '</b>: </p>').append(loadConfigBtn));

            //保存和取消按钮
            boxContent.append($('<hr><p>' + (0, _i18n2.default)("Your configuration will save at User:$1/Wikiplus-config.json on this wiki.").seti18n(_api.API.getUsername()) + '</p>'));
            var saveConfigBtn = $('<input type="button" id="wikiplus-config-btn-save" class="Wikiplus-InterBox-Btn" value="' + (0, _i18n2.default)("Save") + '">');
            var cancelConfigBtn = $('<input type="button" id="wikiplus-config-btn-cancel" class="Wikiplus-InterBox-Btn" value="' + (0, _i18n2.default)("Cancel") + '">');
            cancelConfigBtn.click(function () {
                _ui.UI.closeBox();
            });
            saveConfigBtn.click(function () {
                var config = {};
                config['language'] = languageInput.val();
                config['SendStatistics'] = statInput.find("input")[0].checked ? "True" : "False";
                config['modules'] = modulesInput.val().split(',').map(function (i) {
                    return $.trim(i);
                });

                _this4.saveConfig(config);
            });

            boxContent.append(cancelConfigBtn).append(saveConfigBtn);

            //显示对话框
            _ui.UI.createBox({
                title: (0, _i18n2.default)("Wikiplus Config"),
                content: boxContent
            });
        }
    }, {
        key: 'saveConfig',
        value: function saveConfig(config) {
            var _this5 = this;

            //保存至本地
            this.saveConfigToLocal(config);
            //保存至本Wiki的User:当前用户名/Wikiplus-config.json页面
            config["updatetime"] = new Date().getTime();
            var configString = JSON.stringify(config);
            var configPage = new _Wikipage.Wikipage('User:' + _api.API.getUsername() + '/Wikiplus-config.json');
            configPage.setContent(configString, { summary: "Update Config via Wikiplus" }).then(function (data) {
                _this5.notice.create.success((0, _i18n2.default)("Save config to Server successfully."));
                _ui.UI.closeBox();
            }).catch(function (e) {
                _this5.notice.create.error((0, _i18n2.default)("Save config to Server failed."));
            });
        }
    }, {
        key: 'saveConfigToLocal',
        value: function saveConfigToLocal(config) {
            for (var confKey in config) {
                if (CoreConfig.objectiveConfig[confKey]) {
                    _util.Util.setLocalConfig(confKey, config[confKey], true);
                } else {
                    _util.Util.setLocalConfig(confKey, config[confKey], false);
                }
            }
            this.notice.create.success((0, _i18n2.default)("Save config to local successfully."));
        }
    }, {
        key: 'loadConfig',
        value: function loadConfig() {
            var _this6 = this;

            this.loadConfigHelper().then(function (config) {
                _ui.UI.createDialog({
                    info: (0, _i18n2.default)("Find a uploaded configuration of $1. Do you want to import this config now?").seti18n(new Date(config.updatetime).toLocaleString()),
                    title: (0, _i18n2.default)("Confirm Import"),
                    mode: [{ id: "Yes", text: (0, _i18n2.default)("Yes"), res: true }, { id: "No", text: (0, _i18n2.default)("No"), res: false }]
                }).then(function (res) {
                    if (res) {
                        delete config["updatetime"];
                        _this6.saveConfigToLocal(config);
                    }
                    _ui.UI.closeBox();
                });
            }).catch(function (res) {
                var errorInfo = "";
                switch (res) {
                    case "invalid":
                    case "cannotparse":
                        errorInfo = (0, _i18n2.default)("Saved configuration on server is invalid.");
                        break;
                    case "empty":
                        errorInfo = (0, _i18n2.default)("Can not find any configuration for you on this wiki.");
                        break;
                }
                _this6.notice.create.error(errorInfo);
            });
        }
    }, {
        key: 'loadConfigHelper',
        value: function loadConfigHelper() {
            return new Promise(function (res, rej) {
                var configPage = new _Wikipage.Wikipage('User:' + _api.API.getUsername() + '/Wikiplus-config.json');
                configPage.getWikiText().then(function (data) {
                    if (data) {
                        try {
                            var config = JSON.parse(data);
                            if (config.updatetime) {
                                res(config);
                            } else {
                                rej("invalid");
                            }
                        } catch (err) {
                            rej("cannotparse");
                        }
                    } else {
                        rej("empty");
                    }
                }).catch(function (err) {
                    rej("empty");
                });
            });
        }
    }, {
        key: 'isInstall',
        get: function get() {
            return _util.Util.getLocalConfig('isInstall');
        },
        set: function set(value) {
            _util.Util.setLocalConfig('isInstall', value);
        }
    }, {
        key: 'Version',
        get: function get() {
            return _util.Util.getLocalConfig('Version');
        },
        set: function set(value) {
            _util.Util.setLocalConfig('Version', value);
        }
    }, {
        key: 'language',
        get: function get() {
            return _util.Util.getLocalConfig('language');
        },
        set: function set(value) {
            _util.Util.setLocalConfig('language', value);
        }
    }, {
        key: 'StartUseAt',
        get: function get() {
            return _util.Util.getLocalConfig('StartUseAt');
        },
        set: function set(value) {
            _util.Util.setLocalConfig('StartUseAt', value);
        }
    }, {
        key: 'StartEditCount',
        get: function get() {
            return _util.Util.getLocalConfig('StartEditCount');
        },
        set: function set(value) {
            _util.Util.setLocalConfig('StartEditCount', value);
        }
    }, {
        key: 'SendStatistics',
        get: function get() {
            return _util.Util.getLocalConfig('SendStatistics');
        },
        set: function set(value) {
            _util.Util.setLocalConfig('SendStatistics', value);
        }
    }, {
        key: 'modules',
        get: function get() {
            return _util.Util.getLocalConfig('modules', true);
        },
        set: function set(object) {
            _util.Util.setLocalConfig('modules', object, true);
        }
    }]);

    return CoreConfig;
}();
//需要对象化存入的设置项列表，未设置或设置值为false的将以字符串形式存取。


CoreConfig.objectiveConfig = {
    "modules": true
};

},{"./Wikipage":1,"./api":2,"./i18n":4,"./log":5,"./moduleManager":7,"./ui":9,"./util":10,"./version":11}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.I18n = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * i18n for Wikiplus-3.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


exports.default = i18n;

var _util = require('./util');

var _version = require('./version');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function i18n() {
    var value = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
    var scope = arguments.length <= 1 || arguments[1] === undefined ? "default" : arguments[1];

    var i18nData = window.Wikiplus.__i18nCache;

    if (i18nData === undefined) {
        return value;
    } else {
        var scopeKey = scope + "Scope";
        var i18nScope = i18nData[scopeKey];
        if (i18nScope === undefined) {
            console.warn("i18n: 未知的Scope");
            return value;
        } else if (i18nScope[value] === undefined) {
            console.debug("i18n: 找不到对应翻译", value, "@" + scope + "Scope");
            return value;
        } else {
            return i18nScope[value];
        }
    }
}

var I18n = exports.I18n = function () {
    function I18n(lang) {
        var async = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        _classCallCheck(this, I18n);

        this.lang = lang;
        this.async = async;
    }

    _createClass(I18n, [{
        key: 'initI18n',
        value: function initI18n() {
            var i18nCache = _util.Util.getLocalConfig("i18nCache", true);
            if (i18nCache === undefined) {
                this.load();
            } else if (i18nCache.language != this.lang) {
                this.load();
            } else {
                window.Wikiplus.__i18nCache = i18nCache;
            }
        }
    }, {
        key: 'load',
        value: function load() {
            var _this = this;

            var ajaxConfig = {
                url: _version.Version.scriptURL + '/backend/lang',
                type: "GET",
                data: {
                    "lang": this.lang
                },
                dataType: "json",
                success: function success(data) {
                    if (data.language == _this.lang) {
                        _util.Util.setLocalConfig("i18nCache", data, true);
                        _this.initI18n();
                    } else {
                        console.warn("i18n: 似乎是载入了错误的语言文件。");
                    }
                },
                error: function error() {
                    console.warn("i18n: 找不到此语言对应的语言文件，");
                }
            };
            if (!this.async) {
                ajaxConfig.async = false; // TODO: 同步AJAX将导致浏览器卡顿
            }

            $.ajax(ajaxConfig);
        }
    }]);

    return I18n;
}();

},{"./util":10,"./version":11}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Log = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Universal Logger
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _i18n = require('./i18n');

var _i18n2 = _interopRequireDefault(_i18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Log = exports.Log = function () {
    function Log() {
        _classCallCheck(this, Log);
    }

    _createClass(Log, [{
        key: 'error',
        value: function error(errorName) {
            var e = new Error();
            e.message = (0, _i18n2.default)(errorName) || errorName;
            this.log('错误[' + errorName + ']:' + e.message, 'red');
            this.log('Error Trace:', 'red');
            console.log(e);
            return e;
        }
    }, {
        key: 'log',
        value: function log(message) {
            var color = arguments.length <= 1 || arguments[1] === undefined ? 'black' : arguments[1];

            console.log('%c[Wikiplus]' + message, 'color:' + color);
        }
    }]);

    return Log;
}();

},{"./i18n":4}],6:[function(require,module,exports){
'use strict';

var _core = require('./core');

var _moenotice = require('./moenotice');

/**
 * Wikiplus Main
 */
$(function () {
	var moenotice = new _moenotice.MoeNotification();
	var wikiplus = window.Wikiplus = new _core.Wikiplus(moenotice);

	//主过程启动
	console.log('Wikiplus 开始加载');
	wikiplus.start();
});

},{"./core":3,"./moenotice":8}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ModuleManager = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Wikiplus-mmr
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _version = require('./version');

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModuleManager = exports.ModuleManager = function () {
    function ModuleManager() {
        _classCallCheck(this, ModuleManager);

        //Load Config
        this.modulesConfig = _util.Util.getLocalConfig('modules', true);
        if (this.modulesConfig == undefined) {
            this.modulesConfig = [];
        }
        this.modules = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = this.modulesConfig[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var moduleName = _step.value;

                this.loadModule(moduleName);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }

    _createClass(ModuleManager, [{
        key: 'loadModule',
        value: function loadModule(moduleName) {
            var callbackName = "_wikiplus_mmr_cb" + new Date().getTime();
            //主加载过程
            var self = this;

            //设置回调
            window[callbackName] = function (newModule) {
                self.loadModuleHelper(newModule, moduleName, self);
                delete window[callbackName];
            };

            //载入代码
            var jsurl = _version.Version.scriptURL + "/backend/getmodule?name=" + moduleName + "&callback=" + callbackName;
            _util.Util.loadJs(jsurl);
        }
    }, {
        key: 'loadModuleHelper',
        value: function loadModuleHelper(newModule, moduleName, self) {
            var modules = self.modules;

            if (newModule.manifest == undefined) {
                console.error("无法解析模块 " + moduleName);
            } else if (newModule.manifest.name == moduleName) {
                console.log("加载 " + newModule.manifest.name + " 版本 " + newModule.manifest.version + " 成功。");
                modules[moduleName] = newModule;
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = newModule.manifest.dependencies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var dependencyName = _step2.value;

                        if (self.modulesConfig.indexOf(dependencyName) == -1) {
                            self.modulesConfig.push(dependencyName);
                            console.log('准备加载' + moduleName + '的额外依赖: ' + dependencyName);
                            self.loadModule(dependencyName);
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                this.modulesInit();
            } else {
                console.error("载入模块失败：" + moduleName);
            }
        }
    }, {
        key: 'modulesInit',
        value: function modulesInit() {
            for (var moduleName in this.modules) {
                var module = this.modules[moduleName];

                if (module['__wikiplus_mmr_init_status'] == 'loaded' || module['__wikiplus_mmr_init_status'] == 'skipped') {
                    continue;
                }

                console.log("初始化模块: " + moduleName);
                //检查依赖
                var dpdOk = true;
                var dpds = {};
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = module.manifest.dependencies[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var dpdName = _step3.value;

                        if (this.modules[dpdName] == undefined) {
                            dpdOk = false;
                            break;
                        } else {
                            dpds[dpdName] = this.modules[dpdName];
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                if (dpdOk) {
                    if (module.init(module, dpds)) {
                        console.log('模块' + moduleName + '初始化成功。');
                        module['__wikiplus_mmr_init_status'] = 'loaded';
                    } else {
                        console.log('模块' + moduleName + '认为它自己不应该被初始化。');
                        module['__wikiplus_mmr_init_status'] = 'skipped';
                    }
                } else {
                    console.log('模块' + moduleName + '依赖不满足，等待下次再初始化。');
                }
            }
        }
    }]);

    return ModuleManager;
}();

},{"./util":10,"./version":11}],8:[function(require,module,exports){
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
    this.display = function () {
        var text = arguments.length <= 0 || arguments[0] === undefined ? '喵' : arguments[0];
        var type = arguments.length <= 1 || arguments[1] === undefined ? 'success' : arguments[1];
        var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

        $("#MoeNotification").append($("<div>").addClass('MoeNotification-notice').addClass('MoeNotification-notice-' + type).append($('<span>').text(text)).fadeIn(300));
        self.bind();
        self.clear();
        callback($("#MoeNotification").find('.MoeNotification-notice').last());
    };
    this.create = {
        success: function success(text) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            self.display(text, 'success', callback);
        },
        warning: function warning(text) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            self.display(text, 'warning', callback);
        },
        error: function error(text) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

            self.display(text, 'error', callback);
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
        $("body").append($('<div>').attr('id', 'MoeNotification'));
    };
    if (!($("#MoeNotification").length > 0)) {
        this.init();
    }
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UI = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Wikiplus UI Framework
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _i18n = require('./i18n');

var _i18n2 = _interopRequireDefault(_i18n);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UI = exports.UI = function () {
    function UI() {
        _classCallCheck(this, UI);
    }

    _createClass(UI, null, [{
        key: 'addLinkInToolbox',

        /**
         * 在左侧工具栏添加链接
         * @param {string} option.name 显示出来的链接名
         * @param {string} option.link 链接地址
         * @param {string} option.title 提示文字
         * @param {string} option.id li一级的id，可用来绑定事件（不建议，建议使用callback）
         * @param {function} option.callback 回调函数，用户在点击链接后运行。
         */
        value: function addLinkInToolbox(option) {
            if (option == undefined) {
                throw Error("need options for parameter.");
            }

            var name = option.name || (0, _i18n2.default)('Blank link');
            var link = option.link || 'javascript:;';
            var title = option.title || name;
            var id = option.id || 't-wikiplus-tblink' + new Date().getTime();
            var callback = option.callback || new Function();

            var eleNode = $("<li>").attr({ "id": id }).append($("<a>").attr({ "href": link, "title": title }).html(name));
            $("#p-tb>div>ul").append(eleNode);
            eleNode.on("click", function (event) {
                callback(event);
            });
        }

        /**
         * 建立对话框
         * @param {String} option.info 信息
         * @param {String} option.title = "Wikiplus" 标题栏
         * @param {Object} option.mode 按钮标题和它的返回值，默认值如下
         * mode: [
         *     {id: "Yes", text: _("Yes"), res: true},
         *     {id: "No", text: _("No"), res: false},
         * ]
         */

    }, {
        key: 'createDialog',
        value: function createDialog(option) {
            var info = option.info || '';
            var title = option.title || (0, _i18n2.default)('Wikiplus');
            var mode = option.mode || [{ id: "Yes", text: (0, _i18n2.default)("Yes"), res: true }, { id: "No", text: (0, _i18n2.default)("No"), res: false }];

            return new Promise(function (resolve, reject) {
                var notice = $('<div>').text(info).attr('id', 'Wikiplus-InterBox-Content');
                var content = $('<div>').append(notice).append($('<hr>'));
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = mode[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _btnOpt = _step.value;

                        var dialogBtn = $('<div>').addClass('Wikiplus-InterBox-Btn').attr('id', 'Wikiplus-InterBox-Btn' + _btnOpt.id).text(_btnOpt.text).data('value', _btnOpt.res);
                        content.append(dialogBtn);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                UI.createBox({
                    title: title,
                    content: content,
                    callback: function callback() {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            var _loop = function _loop() {
                                var btnOpt = _step2.value;

                                $('#Wikiplus-InterBox-Btn' + btnOpt.id).click(function () {
                                    var resValue = $('#Wikiplus-InterBox-Btn' + btnOpt.id).data('value');
                                    UI.closeBox();
                                    resolve(resValue);
                                });
                            };

                            for (var _iterator2 = mode[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                _loop();
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }
                });
            });
        }

        /**
         * 关闭Wikiplus弹出框
         */

    }, {
        key: 'closeBox',
        value: function closeBox() {
            $('.Wikiplus-InterBox').fadeOut('fast', function () {
                $(this).remove();
            });
        }

        /**
         * 画框
         * @param {String} option.title 标题
         * @param {HTML} option.content 内容
         * @param {Integer} option.width = 600 宽度，单位为px
         * @param {function()} option.callback 回调函数
         */

    }, {
        key: 'createBox',
        value: function createBox(option) {
            var title = option.title || (0, _i18n2.default)("Wikiplus");
            var content = option.content || "";
            var width = option.width || 600;
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
                'margin-left': clientWidth / 2 - width / 2 + 'px',
                'top': $(document).scrollTop() + clientHeight * 0.2,
                'display': 'none'
            }).append($('<div>').addClass('Wikiplus-InterBox-Header').html(title)).append($('<div>').addClass('Wikiplus-InterBox-Content').append(content)).append($('<span>').text('×').addClass('Wikiplus-InterBox-Close'));
            $('body').append(diglogBox);
            $('.Wikiplus-InterBox').width(width + 'px');
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
    }]);

    return UI;
}();

},{"./i18n":4}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Wikiplus util library
 */
var Util = exports.Util = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
        key: "loadCss",

        //Load css (jQuery required)
        value: function loadCss(path) {
            var cssNode = document.createElement('link');
            $(cssNode).attr({
                rel: "stylesheet",
                type: "text/css",
                href: path
            });
            $("head").append(cssNode);
        }

        //Load js (jQuery required)

    }, {
        key: "loadJs",
        value: function loadJs(path) {
            var jsnode = document.createElement('script');
            $(jsnode).attr({
                type: 'text/javascript',
                async: false,
                src: path
            });
            $("head").append(jsnode);
        }

        //save local config

    }, {
        key: "setLocalConfig",
        value: function setLocalConfig(key) {
            var value = arguments.length <= 1 || arguments[1] === undefined ? "" : arguments[1];
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

            try {
                key = "Wikiplus-" + key;
                if (isObj) {
                    return JSON.parse(localStorage[key]);
                } else {
                    return localStorage[key];
                }
            } catch (e) {
                return undefined;
            }
        }

        //Run once at Wikiplus init.

    }, {
        key: "scopeConfigInit",
        value: function scopeConfigInit() {
            String.prototype.seti18n = function () {
                var argc = arguments.length;
                var res = this;
                for (var i = 1; i <= argc && i <= 9; i++) {
                    res = res.replace(new RegExp("\\$" + i, "g"), arguments[i - 1]);
                }
                return res;
            };
        }
    }]);

    return Util;
}();

},{}],11:[function(require,module,exports){
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

Version.VERSION = "1.0.3";
Version.releaseNote = "i18n生成器的更新。";
Version.scriptURL = "http://localhost/Wikiplus-3.0"; //请不要以斜杠“/”结尾

},{}]},{},[6]);
