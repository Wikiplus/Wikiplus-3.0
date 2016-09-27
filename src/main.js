/**
 * Wikiplus Main
 */
import {Wikiplus} from './core'
import {MoeNotification} from './moenotice'

$(function () {
    let MoeNotice = new MoeNotification();
    let Wikiplus = window.Wikiplus = new Wikiplus(MoeNotice);

    //主过程启动
    console.log('Wikiplus 开始加载');
    Wikiplus.start();
});
