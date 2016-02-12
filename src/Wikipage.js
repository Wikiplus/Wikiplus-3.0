/**
 * Wikipage
 * MediaWiki Front-end SDK
 */
import { API } from './api'
export class Wikipage {
    /**
     * 构造函数
     * @param {string} title 页面标题
     * @param {string} revision 页面修订版本号
     * @param {function} callback 回调函数
     */
    constructor(title = window.mw.config.values.wgPageName, revision = window.mw.config.values.wgRevisionId, callback = new Function()){
        var self = this;
        this.title = title;
        this.revision = revision;
        // 查询本页面基础信息
        Promise.all([API.getEditToken(title),API.getTimeStamp(title)]).then((data)=>{
            this.editToken = data[0];
            this.timeStamp = data[1];
        }).catch((e)=>{
            console.log('获取页面基础信息失败');
        });
    }

    /**
     * 重定向至
     * @param {string} target 目标页面
     */
    redirectTo(target){
        return API.redirectTo(target, this.editToken);
    }

    /**
     * 重定向从
     * @param {string} origin 源页面
     */
    redirectFrom(origin){
        return API.redirectFrom(origin, this.editToken);
    }

    /**
     * 修改本页面内容
     * @param {string} content 新的页面内容
     * @param {string} summary 编辑摘要
     */
    setContent(content, summary){
        return API.edit({
            "title" : this.title,
            "editToken" : this.editToken,
            "timeStamp" : this.timeStamp,
            "content" : content,
            "summary" : summary
        });
    }

    /**
     * 获得当前页面的WikiText
     */
    getWikiText(){
        return API.getWikiText(this.title, this.revision);
    }
}