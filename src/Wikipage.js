/**
 * Wikipage
 * MediaWiki Front-end SDK
 */
import { API } from './api'
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
        }).catch((e) => {
            console.error('获取页面基础信息失败：', e);
        });
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
     * 修改本页面内容
     * @param {string} content 新的页面内容
     * @param {string} summary 编辑摘要
     */
    setContent(content, summary) {
        return new Promise((res, rej) => {
            this.info = this.info.then(() => {
                API.edit({
                    "title": this.title,
                    "editToken": this.editToken,
                    "timeStamp": this.timeStamp,
                    "content": content,
                    "summary": summary
                }).then(data=> {
                    res(data);
                });
            });
        });
    }

    /**
     * 获得当前页面的WikiText
     * @param {string} revision (可选)修订版本
     */
    getWikiText(revision) {
        return new Promise((res, rej) => {
            this.info = this.info.then(() => {
                API.getWikiText(this.title, revision).then(data => {
                    res(data);
                });
            });
        });
    }
}