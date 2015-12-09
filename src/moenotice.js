/**
 * MoeNotification mini
 */
export function MoeNotification() {
    var self = this;
    this.display = function (text, type, callback) {
        var _callback = callback || function () { };
        var _text = text || '喵~';
        var _type = type || 'success';
        $("#MoeNotification").append(
            $("<div>").addClass('MoeNotification-notice')
                .addClass('MoeNotification-notice-' + _type)
                .append('<span>' + _text + '</span>')
                .fadeIn(300)
            );
        self.bind();
        self.clear();
        _callback($("#MoeNotification").find('.MoeNotification-notice').last());
    }
    this.create = {
        success: function (text, callback) {
            var _callback = callback || function () { };
            self.display(text, 'success', _callback);
        },
        warning: function (text, callback) {
            var _callback = callback || function () { };
            self.display(text, 'warning', _callback);
        },
        error: function (text, callback) {
            var _callback = callback || function () { };
            self.display(text, 'error', _callback);
        }
    };
    this.clear = function () {
        if ($(".MoeNotification-notice").length >= 10) {
            $("#MoeNotification").children().first().fadeOut(150, function () {
                $(this).remove();
            });
            setTimeout(self.clear, 300);
        }
        else {
            return false;
        }
    }
    this.empty = function (f) {
        $(".MoeNotification-notice").each(function (i) {
            if ($.isFunction(f)) {
                var object = this;
                setTimeout(function () {
                    f($(object));
                }, 200 * i);
            }
            else {
                $(this).delay(i * 200).fadeOut('fast', function () {
                    $(this).remove();
                })
            }
        })
    }
    this.bind = function () {
        $(".MoeNotification-notice").mouseover(function () {
            self.slideLeft($(this));
        });
    }
    window.slideLeft = this.slideLeft = function (object, speed) {
        object.css('position', 'relative');
        object.animate({
            left: "-200%",
        },
            speed || 150, function () {
                $(this).fadeOut('fast', function () {
                    $(this).remove();
                });
            });
    }
    this.init = function () {
        $("body").append('<div id="MoeNotification"></div>');
    }
    if (!($("#MoeNotification").length > 0)) {
        this.init();
    }
}
