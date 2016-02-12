/**
 * Wikipage
 * MediaWiki Front-end SDK
 */
import { API } from './api'
export class Wikipage {
    constructor(title = window.mw.config.values.wgPageName){
        var self = this;
        // 查询本页面基础信息
        Promise.all([API.getEditToken(title),API.getTimeStamp(title)]).then((data)=>{
            this.editToken = data[0];
            this.timeStamp = data[1];
        }).catch((e)=>{
            console.log('获取页面基础信息失败');
        });
    }


}