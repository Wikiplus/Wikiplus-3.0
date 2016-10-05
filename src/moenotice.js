/**
 * MoeNotification mini
 */
export function MoeNotification() {
    var self = this;
    this.display = function (text = '喵', type = 'success', callback = () => {
    }) {
        $("#MoeNotification").append(
            $("<div>").addClass('MoeNotification-notice')
                .addClass('MoeNotification-notice-' + type)
                .append(
                    $('<span>').text(text)
                )
                .fadeIn(300)
        );
        self.bind();
        self.clear();
        callback($("#MoeNotification").find('.MoeNotification-notice').last());
    };
    this.create = {
        success: function (text, callback = () => {
        }) {
            self.display(text, 'success', callback);
        },
        warning: function (text, callback = () => {
        }) {
            self.display(text, 'warning', callback);
        },
        error: function (text, callback = () => {
        }) {
            self.display(text, 'error', callback);
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
    };
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
    };
    this.bind = function () {
        $(".MoeNotification-notice").mouseover(function () {
            self.slideLeft($(this));
        });
    };
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
    };
    this.init = function () {
        $("body").append(
            $('<div>').attr('id', 'MoeNotification')
        );
    };
    if (!($("#MoeNotification").length > 0)) {
        this.init();
    }
}
