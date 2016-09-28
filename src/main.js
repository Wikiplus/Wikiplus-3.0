/**
 * Wikiplus Main
 */
import { Wikiplus } from './core'
import { MoeNotification } from './moenotice'

$(function(){
	let moenotice = new MoeNotification();
	let wikiplus = window.Wikiplus = new Wikiplus(moenotice);

	//主过程启动
	console.log('Wikiplus 开始加载');
	wikiplus.start();
});
