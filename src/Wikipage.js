/**
 * Wikipage
 * MediaWiki Front-end SDK
 */
import {API} from './api'
export class Wikipage {
    /**
     * 构造函数
     * @param {string} title 页面标题
     */
    constructor(title = window.mw.config.values.wgPageName) {
        this.title = title;
        // 查询本页面基础信息
        this.info = Promise.all([API.getEditToken(title), API.getTimeStamp(title)]).then((data) => {
            this.editToken = data[0];
            this.timeStamp = data[1];
            console.log(`获取页面${title}信息成功`);
        }).catch((e) => {
            console.error('获取页面基础信息失败：', e);
        });
        this.wikiTextCache = {}; // WikiText缓存
        this.lastestRevision = window.mw.config.values.wgCurRevisionId;
    }

    /**
     * 重定向至
     * @param {string} target 目标页面
     */
    redirectTo(target) {
        this.info = this.info.then(() => {
            API.redirectTo(target, this.editToken);
        });
    }

    /**
     * 重定向从
     * @param {string} origin 源页面
     */
    redirectFrom(origin) {
        this.info = this.info.then(() => {
            API.redirectFrom(origin, this.editToken);
        });
    }

    /**
     * 修改页面内容
     * @param {string} content
     * @param {object} config
     * @returns {Promise}
     */
    setContent(content, config = {}) {
        return new Promise((res, rej) => {
            this.info = this.info.then(() => {
                API.edit($.extend({
                    "title": this.title,
                    "token": this.editToken,
                    "basetimestamp": this.timeStamp,
                    "text": content
                }, config)).then(data=> {
                    res(data);
                }).catch(e => {

                })
            });
        });
    }

    /**
     * 获得当前页面的WikiText
     * @param {string} section
     * @param {string} revision (可选)修订版本
     */
    getWikiText(section = 'page', revision = undefined) {
        // page是一个不合法的参数值 但是MediaWiki会忽略不合法的参数值 等价于获取全页
        return new Promise((res, rej) => {
            if (revision){
                if (this.wikiTextCache[`${revision}#${section}`]){
                    res(this.wikiTextCache[`${revision}#${section}`]);
                }
                else{
                    this.info = this.info.then(()=>{
                        API.getWikiText(this.title, section, revision).then((wikiText)=>{
                            this.wikiTextCache[`${revision}#${section}`] = wikiText;
                            res(wikiText);
                        }).catch(rej);
                    })
                }
            }
            else{
                if (this.wikiTextCache[`${section}`]){
                    res(this.wikiTextCache[`${section}`]);
                }
                else{
                    this.info = this.info.then(()=>{
                        API.getWikiText(this.title, section).then(wikiText=>{
                            this.wikiTextCache[`${section}`] = wikiText;
                            res(wikiText);
                        })
                    })
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
    parseWikiText(wikiText = '', pageName = this.title){
        return new Promise((res, rej)=>{
            this.info = this.info.then(()=>{
                API.parseWikiText(wikiText, this.title).then(res).catch(rej);
            })
        })
    }
}