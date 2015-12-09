/**
 * Wikiplus Main
 */
import {Wikiplus} from './core'
import {MoeNotification} from './moenotice'

$(function(){
	let moenotice = new MoeNotification();
	let wikiplus = window.Wikiplus = new Wikiplus();
	console.log('Wikiplus 开始加载');
	
	//依赖注入
	wikiplus.setMoenotice(moenotice);
	//主过程启动
	wikiplus.start();
})
