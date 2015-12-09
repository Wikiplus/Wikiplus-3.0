/**
 * Wikiplus Core
 */
export class Wikiplus {
	//初始化
	constructor(){
		
	}
	//moenotice
	setMoenotice(value) {
		this.moenotice = value;
	}
	start(){
		this.moenotice.create.success("Test Run");
	}
}