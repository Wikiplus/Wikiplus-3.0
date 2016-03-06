# Wikiplus-3.0

    提示：
    Wikiplus-3.0中的3.0不是版本号。
	
	而是作者的卖萌。
	
## Wikiplus-3.0 简介

Wikiplus是一个通过使用jQuery和Mediawiki API直接对Mediawiki站点的页面进行编辑，来增强Mediawiki站点的编辑体验的工具。

Wikiplus-3.0 将Wikiplus的功能拆分成为模块，同时开放API，使得在Wikiplus-3.0的基础上进行扩展十分容易。

## 安装和设置

安装Wikiplus-3.0只需要在你的Wiki用户页/common.js中加入以下代码：

    mw.loader.load('{Wikiplus的发布地址}/Wikiplus.min.js');
	/* Wikiplus-3.0 尚未正式发布，因此无法用这种方式直接使用。 */

如果你的Wiki将Wikiplus加入了小工具列表，你可以直接在设置中启用。

可以直接在Wikiplus的设置界面中填写模块名来启用模块，默认启用了quickedit（快速编辑）模块。

这个设置界面可以在你的用户页左侧工具栏中找到。

这个工具在安装时会修改你的用户页/Wikiplus-config.json，向其中写入配置信息。

在其他设备登录时或是浏览器缓存丢失时可直接恢复设置。请不要随意删除或修改，可能会使Wikiplus工作不正常。

## 卸载

只需要删除你的用户页/common.js的加载代码即可。

如果你是从小工具设置中启用的，那么在设置页面取消勾选Wikiplus即可。

## 模块系统

Wikiplus-3.0的独特功能就是它的模块系统。任何用户都可以编写一个Wikiplus的增强功能模块。

Wikiplus自身会提供大量方便操作的API给模块使用，同时也支持使用其他模块提供的API。

模块开发请参考 Wikiplus/module-SDK (未完成)

API请参考 Wikiplus/Wikiplus-doc (未完成)

模块自行提供的API请参考各模块版本库内的文档或是Wiki中的说明。

## 授权

本项目在 Apache License 2.0 协议下开源。