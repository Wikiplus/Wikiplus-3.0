/**
 * Wikiplus UI Framework
 */
import _ from './i18n'

export class UI {
    /**
     * 在左侧工具栏添加链接
     * @param {string} option.name 显示出来的链接名
     * @param {string} option.link 链接地址
     * @param {string} option.title 提示文字
     * @param {string} option.id li一级的id，可用来绑定事件（不建议，建议使用callback）
     * @param {function} option.callback 回调函数，用户在点击链接后运行。
     */
    static addLinkInToolbox(option) {
        if (option == undefined) {
            throw Error("need options for parameter.");
        }

        let name = option.name || _('Blank link');
        let link = option.link || 'javascript:;';
        let title = option.title || name;
        let id = option.id || 't-wikiplus-tblink' + (new Date().getTime());
        let callback = option.callback || new Function();

        let eleNode = $("<li>").attr({"id": id}).append($("<a>").attr({"href": link, "title": title}).html(name));
        $("#p-tb>div>ul").append(eleNode);
        eleNode.on("click", function (event) {
            callback(event);
        })
    }

    static addLinkInDropDownMenu(options){
        var id = options.id || 'Wikiplus-' + (Math.random() + 1).toString(36).substring(4,8); // 如果没有给定ID，那么随机生成一个
        var text = options.text || '';
        
    };

    /**
     * 建立对话框
     * @param {String} option.info 信息
     * @param {String} option.title = "Wikiplus" 标题栏
     * @param {Object} option.mode 按钮标题和它的返回值，默认值如下
     * mode: [
     *     {id: "Yes", text: _("Yes"), res: true},
     *     {id: "No", text: _("No"), res: false},
     * ]
     */
    static createDialog(option) {
        let info = option.info || '';
        let title = option.title || _('Wikiplus');
        let mode = option.mode || [{id: "Yes", text: _("Yes"), res: true}, {id: "No", text: _("No"), res: false},];

        return new Promise((resolve, reject) => {
            let notice = $('<div>').text(info).attr('id', 'Wikiplus-InterBox-Content');
            let content = $('<div>').append(notice).append($('<hr>'));
            for (let btnOpt of mode) {
                let dialogBtn = $('<div>')
                    .addClass('Wikiplus-InterBox-Btn')
                    .attr('id', `Wikiplus-InterBox-Btn${btnOpt.id}`)
                    .text(btnOpt.text)
                    .data('value', btnOpt.res);
                content.append(dialogBtn);
            }
            UI.createBox({
                title: title,
                content: content,
                callback: function () {
                    for (let btnOpt of mode) {
                        $(`#Wikiplus-InterBox-Btn${btnOpt.id}`).click(function () {
                            let resValue = $(`#Wikiplus-InterBox-Btn${btnOpt.id}`).data('value');
                            UI.closeBox();
                            resolve(resValue);
                        });
                    }
                }
            });
        });
    }

    /**
     * 关闭Wikiplus弹出框
     */
    static closeBox() {
        $('.Wikiplus-InterBox').fadeOut('fast', function () {
            $(this).remove();
        })
    }


    /**
     * 画框
     * @param {String} option.title 标题
     * @param {html} option.content 内容
     * @param {int} option.width = 600 宽度，单位为px
     * @param {function()} option.callback 回调函数
     */
    static createBox(option) {
        let title = option.title || _("Wikiplus");
        let content = option.content || "";
        let width = option.width || 600;
        let callback = option.callback || new Function();

        //检查是否已存在
        if ($('.Wikiplus-InterBox').length > 0) {
            $('.Wikiplus-InterBox').each(function () {
                $(this).remove();
            });
        }

        let clientWidth = document.body.clientWidth;
        let clientHeight = document.body.clientHeight;
        let diglogBox = $('<div>').addClass('Wikiplus-InterBox')
            .css({
                'margin-left': ((clientWidth / 2) - (width / 2)) + 'px',
                'top': $(document).scrollTop() + clientHeight * 0.2,
                'display': 'none'
            })
            .append(
                $('<div>').addClass('Wikiplus-InterBox-Header')
                    .html(title)
            )
            .append(
                $('<div>').addClass('Wikiplus-InterBox-Content')
                    .append(content)
            )
            .append(
                $('<span>').text('×').addClass('Wikiplus-InterBox-Close')
            );
        $('body').append(diglogBox);
        $('.Wikiplus-InterBox').width(width + 'px');
        $('.Wikiplus-InterBox-Close').click(function () {
            $(this).parent().fadeOut('fast', function () {
                window.onclose = window.onbeforeunload = undefined; //取消页面关闭确认
                $(this).remove();
            })
        });
        //拖曳
        let bindDragging = function (element) {
            element.mousedown(function (e) {
                let baseX = e.clientX;
                let baseY = e.clientY;
                let baseOffsetX = element.parent().offset().left;
                let baseOffsetY = element.parent().offset().top;
                $(document).mousemove(function (e) {
                    element.parent().css({
                        'margin-left': baseOffsetX + e.clientX - baseX,
                        'top': baseOffsetY + e.clientY - baseY
                    })
                });
                $(document).mouseup(function () {
                    element.unbind('mousedown');
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                    bindDragging(element);
                })
            });
        };
        bindDragging($('.Wikiplus-InterBox-Header'));
        $('.Wikiplus-InterBox').fadeIn(500);
        callback();
    }
}