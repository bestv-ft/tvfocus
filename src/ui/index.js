var Layout = require('../layout');
var Box;
var Timer;
var borderWidth = 2;
var CacheStyle = {
    top: '0px',
    left: '0px',
    zIndex: '990',
    borderRadius: '6px',
    position: 'absolute',
    backfaceVisibility:'hidden',
    border: '2px solid #b6f2ff',
    webkitTransitionProperty: 'opacity',
    boxShadow: '#22c8de 0px 0px 22px 8px, #42e3f6 0px 0px 4px 1px inset',
};
function renderBox() {
    if (!Box) {
        Box = document.createElement('div');
        for (var i in CacheStyle) {
            if ('className' == i) {
                Box.className = CacheStyle.className;
            }
            else {
                Box.style[i] = CacheStyle[i];
            }
        }
        document.body.appendChild(Box);
    }
    else {
        Box.offsetHeight;
        for (var i in CacheStyle) {
            Box.style[i] = CacheStyle[i];
        }
    }
    CacheStyle = {};
}

function setUI (w_,h_,x_,y_) {
    x_ = x_ - borderWidth;
    y_ = y_ - borderWidth;
    //ext_中css值不要加引号
    if (1 === Layout.moveType) {
        CacheStyle.webkitTransform = 'translate3d(' + x_ + 'px,' + y_ + 'px,0px)';
    }
    else {
        CacheStyle.left = x_ + 'px';
        CacheStyle.top = y_ + 'px';
    }
    CacheStyle.opacity = '1';
    CacheStyle.width = w_ + 'px';
    CacheStyle.height = h_ + 'px';
    renderBox();
}

/**
 * 落焦控制，决定是否延时落焦等。
 *
 */
function amendUI (w_,h_,x_,y_, delay_) {
    if (Box) {
        CacheStyle.opacity = '0';
        CacheStyle.webkitTransitionDuration =  '0s';
        renderBox();
    }
    if (Timer) {
        clearTimeout(Timer);
        Timer = 0;
    }
    if (delay_) {
        Timer = setTimeout(function() {
            Timer = 0;
            setUI(w_,h_,x_,y_);
        }, delay_);
    }
    else {
        setUI(w_,h_,x_,y_);
    }
}

module.exports = {
    on : function (w_,h_,x_,y_, delay_) {
        amendUI(w_,h_,x_,y_, delay_);
    },
    hide : function () {
        if (Timer) {
            clearTimeout(Timer);
            Timer = 0;
        }
        CacheStyle.opacity = '0';
        CacheStyle.webkitTransitionDuration =  '0s';
        renderBox();
    },
    setStyle : function(style_) {
        if ('string' == typeof(style_)) {
            //需要取borderWidth
            DefaultStyle.opacity = '0';
            DefaultStyle.className = style_;
            renderBox();
            var _style = getComputedStyle(Box, null);
            borderWidth = parseInt(_style.borderWidth) || 0;
        }
        else {
            for (var i in style_) {
                DefaultStyle[i] = style_[i];
            }
            if (style_['border']) {
                borderWidth = parseInt(style_['border']);
            }
            else if (style_['borderWidth']) {
                borderWidth = parseInt(style_['borderWidth']);
            }
        }
    }
}