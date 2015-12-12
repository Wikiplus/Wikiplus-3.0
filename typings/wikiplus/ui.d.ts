/**
 * UI部分静态函数的定义
 */

/**
 * 模态框按钮选项
 */
interface DialogBoxBtnOption{
	/**
	 * 按钮唯一标识值。（和HTMLID不同）
	 */
	id?: string;
	/**
	 * 按钮文字内容。
	 */
	text?: string;
	/**
	 * 当按钮被按下后的返回值。在createDialog返回的Promise对象中用then方法接收。
	 */
	res?: any;
}

/**
 * 建立对话框函数选项
 */
interface DialogBoxOption{
	/**
	 * 对话框信息文本。
	 */
	info?: string;
	/**
	 * 对话框标题。
	 */
	title?: string;
	/**
	 * 对话框中包含的按钮。
	 */
	mode?: DialogBoxBtnOption[];
}

/**
 * 建立通用浮动框选项
 */
interface BoxOption{
	/**
	 * 标题文本。
	 */
	title?: string;
	/**
	 * 浮动框中内容的HTML。
	 */
	content?: JQuery|Element|any[]|Text|string;
	/**
	 * 浮动框宽度。单位为px。默认值为600px。
	 */
	width?: number;
	/**
	 * 建立结束后的回调函数。
	 */
	callback?: Function;
}

/**
 * 控制Wikiplus的UI显示，提供建立和处理对话框API
 */
interface UIStatic{
	/**
	 * 建立对话框
	 * @param option 对话框选项。
	 */
	createDialog(option: DialogBoxOption): Function;
	/**
	 * 关闭Wikiplus弹出框
	 */
	closeBox();
	/**
	 * 建立通用浮动框。
	 */
	createBox(option: BoxOption);
}

interface JQuery{}
declare var UI: UIStatic;