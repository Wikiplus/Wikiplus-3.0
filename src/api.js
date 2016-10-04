/**
 * Mediawiki API Wrapper
 */
import _ from './i18n'
import {Version} from './version'
import {Log} from './log'

export class API {
    constructor(){
        this.Log = new Log();
    }
    /**
     * 返回API地址
     * @return {string} API API地址
     */
    static getAPIURL() {
        return `${location.protocol}//${location.host}${window.mw.config.values.wgScriptPath}/api.php`;
    }

    /**
     * 返回当前页页面名。
     * @return {string} pageName 页面标题
     */
    static getThisPageName() {
        let pageName = window.mw.config.values.wgPageName;
        if (pageName === undefined) {
            throw new Error("Fail to get the title of this page."); // 这错误也能触发 运气很好
        }
        else {
            return pageName;
        }
    }

    /**
     * 返回当前的用户名
     * @return {string} username 当前登录用户名
     */
    static getUsername() {
        let getUserId = window.mw.user.id;
        if (getUserId === undefined) {
            throw new Error("Fail to get the title of this page."); // 这错误也能触发 运气很好
        }
        else {
            return getUserId();
        }
    }

    /**
     * 返回编辑令牌
     * @return Promise
     */
    static getEditToken(title) {
        let self = this;
        return new Promise((resolve, reject) => {
            if (window.mw.user.tokens.get('editToken') && window.mw.user.tokens.get('editToken') !== '+\\') {
                resolve(window.mw.user.tokens.get('editToken'));
            }
            else {
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
                    success: (data) => {
                        if (data.query && data.query.tokens && data.query.tokens.csrftoken && data.query.tokens.csrftoken !== '+\\') {
                            resolve(data.query.tokens.csrftoken);
                        }
                        else {
                            self.Log.error('fail_to_get_edittoken');
                            reject(_('fail_to_get_edittoken'));
                        }
                    },
                    error: (e) => {
                        self.Log.error('fail_to_get_edittoken');
                        reject(_('fail_to_get_edittoken'));
                    }
                })
            }
        })
    }

    /**
     * 获取编辑起始时间戳
     * @param {string} title 页面标题
     * @return Promise
     */
    static getTimeStamp(title) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: this.getAPIURL(),
                type: "GET",
                dataType: "json",
                data: {
                    'action': 'query',
                    'prop': 'revisions|info',
                    'titles': title,
                    'rvprop': 'timestamp',
                    'format': 'json'
                },
                beforeSend: function () {
                    console.time('获得页面基础信息时间耗时');
                },
                success: (data) => {
                    if (data && data.query && data.query.pages) {
                        let info = data.query.pages;
                        for (var key in info) {
                            if (key !== '-1') {
                                if (info[key].revisions && info[key].revisions.length > 0) {
                                    resolve(info[key].revisions[0].timestamp);
                                    console.timeEnd('获得页面基础信息时间耗时');
                                }
                                else {
                                    reject(new Error('Fail to get the timestamp of this page.'));
                                    console.timeEnd('获得页面基础信息时间耗时');
                                }
                            }
                            else {
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
                error: (e) => {
                    reject(new Error(`Fail to get the timestamp of this page.`));
                    console.timeEnd('获得页面基础信息时间耗时');
                }
            })
        })
    }

    /**
     * 页面编辑
     * @param {object} config
     */
    static edit(config = {}) {
        let self = this;
        return new Promise((resolve, reject) => {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: this.getAPIURL(),
                data: $.extend({
                    'action': 'edit',
                    'format': 'json'
                }, config),
                success: (data) => {
                    if (data && data.edit) {
                        if (data.edit.result && data.edit.result == 'Success') {
                            resolve(data.edit);
                        }
                        else {
                            if (data.edit.code) {
                                //防滥用过滤器
                                self.Log.error('hit_abusefilter');
                                reject(`${_('hit_abusefilter') }:${data.edit.info.replace('/Hit AbuseFilter: /ig', '') }<br><small>${data.edit.warning}</small>`);
                            }
                            else {
                                self.Log.error('unknown_edit_error');
                                reject(_('unknown_edit_error'));
                            }
                        }
                    }
                    else if (data && data.error && data.error.code) {
                        self.Log.error(data.error.code);
                        reject(_(data.error.code));
                    }
                    else if (data.code) {
                        self.Log.error(data.code);
                        reject(_(data.code));
                    }
                    else {
                        self.Log.error('unknown_edit_error');
                        reject(_('unknown_edit_error'));
                    }
                },
                error: (e) => {
                    self.Log.error('network_edit_error');
                    reject(_('network_edit_error'));
                }
            })
        })
    }

    /**
     * 重定向至
     * @param {string} target 目标页面
     * @param {string} editToken 编辑令牌
     * @param {object} config 自定义设置
     */
    static redirectTo(target, editToken, config) {
        return this.edit($.extend({
            "title": window.mw.config.values.wgPageName,
            "content": `#REDIRECT [[${target}]]`,
            "editToken": editToken,
            "summary": _(`Redirect [[${window.mw.config.values.wgPageName}]] to [[${target}]] via Wikiplus`),
        }, config));
    }

    /**
     * 重定向从
     * @param {string} origin 源页面
     * @param {string} editToken 编辑令牌
     * @param {object} config 自定义设置
     */
    static redirectFrom(origin, editToken, config) {
        return this.edit($.extend({
            "title": origin,
            "content": `#REDIRECT [[${window.mw.config.values.wgPageName}]]`,
            "editToken": editToken,
            "summary": _(`Redirect [[${origin}]] to [[${window.mw.config.values.wgPageName}]] via Wikiplus`)
        }, config));
    }

    /**
     * 获取页面WikiText
     * @param {string} title 页面名
     * @param {string} section 段落编号(可选)
     * @param {string} revision 修订版本号(可选)
     * @return Promise
     */
    static getWikiText(title, section = '', revision = '') {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${location.protocol}//${location.host}${window.mw.config.values.wgScriptPath}/index.php`,
                type: "GET",
                dataType: "text",
                cache: false,
                data: {
                    "title": title,
                    "action": 'raw',
                    "oldid": revision,
                    "section": section
                },
                beforeSend: function () {
                    console.time('获得页面文本耗时');
                },
                success: (data) => {
                    resolve(data);
                    console.timeEnd('获得页面文本耗时');
                },
                error: (e) => {
                    reject(new Error('Fail to get the WikiText of this page.'));
                }
            })
        })
    }

    /**
     * 解析WikiText
     * @param {string} wikitext
     * @param pageName
     */
    static parseWikiText(wikitext = '', pageName = this.getThisPageName()) {
        return new Promise((resolve, reject) => {
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
                url: this.getAPIURL(),
                success: (data) => {
                    if (data && data.parse && data.parse.text) {
                        resolve(data.parse.text['*']);
                    }
                    else {
                        reject(new Error('Fail to parse WikiText.'));
                    }
                },
                error: (e) => {
                    reject(new Error('Fail to parse WikiText due to network reasons.'));
                }
            })
        })
    }
}