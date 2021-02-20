var SIZE_HISTORY = {};
var debug_colors = ['#e61717','#3082d6','#fad538'];
var debug_color_index = 0;

module.exports = {
    OpenDebug : 0,
    moveType : 1,
    calcSpace: function(node_) {
        if (undefined === node_.$layout) {
            var _ele, _rect, _left, _top,_style;
            if (undefined !== node_.scrollY) { //@xxx 有垂直滑动布局的节点，需要取滑动块的宽高，有水平滑动的节点，不需要，因为后面可能要重排。
                _ele = node_.$scroll;
            }
            else {
                _ele = node_.$ele;
            }
            _rect = _ele.getBoundingClientRect();
            _left = parseInt(_rect.left);
            _top = parseInt(_rect.top);
            if (node_.parent) {
                if (node_.parent.scrollX) {
                    node_.left = _left - node_.parent.x - node_.parent.scrollX;
                }
                else {
                    node_.left = _left - node_.parent.x;
                }
                if (node_.parent.scrollY) {
                    node_.top = _top - node_.parent.y - node_.parent.scrollY;
                }
                else {
                    node_.top = _top - node_.parent.y;
                }
            }
            else {
                node_.left = _left;
                node_.top = _top;
            }
            node_.width = parseInt(_rect.width);
            node_.height = parseInt(_rect.height);
            if (node_.parent && undefined !== node_.parent.$calcSize) {
                var _size = node_.parent.$calcSize;
                if (undefined === _size.x) {
                    _size.y = node_.top;
                }
                else {
                    if (_size.y != node_.top) {
                        if (undefined === _size.g) {
                            _style = getComputedStyle(node_.$ele, null);
                            _size.g = node_.left + (parseInt(_style.marginRight)||0);
                        }
                        node_.left = _size.x + _size.g;
                        node_.top = _size.y;
                    }
                    else if (undefined === _size.g) {
                        _size.g = node_.left - _size.x;
                    }
                }
                _size.x = node_.left + node_.width;
            }
            node_.x = _left;
            node_.y = _top;
            return;
        }
        var _layout = node_.$layout;
        node_.left = _layout.left || 0;
        node_.top = _layout.top || 0;
        if (undefined === _layout.width || undefined === _layout.height) {
            if (SIZE_HISTORY[node_.name]) {
                node_.width = SIZE_HISTORY[node_.name].width;
                node_.height = SIZE_HISTORY[node_.name].height;
            }
            else {
                _style = getComputedStyle(node_.$ele, null);
                if (undefined === _layout.width) {
                    node_.width = parseInt(_style.width);
                }
                else {
                    node_.width = _layout.width;
                }
                if (undefined === _layout.height) {
                    node_.height = parseInt(_style.height);
                }
                else {
                    node_.height = _layout.height;
                }
                SIZE_HISTORY[node_.name] = {width:node_.width, height:node_.height};
            }
        }
        else {
            node_.width = _layout.width;
            node_.height = _layout.height;
        }
        if (node_.parent) {
            node_.x = node_.left + node_.parent.x;
            node_.y = node_.top + node_.parent.y;
            if (undefined !== node_.parent.$calcSize) {
                var _size = node_.parent.$calcSize;
                if (undefined === _size.x) {
                    _size.x = 0;
                    _size.g = node_.left*2; //@xxx 此处只能假定，子节点的左右外边距是相等的。
                }
                if (node_.left > _size.x) {
                    _size.x = node_.left;
                }
                _size.x = _size.x + node_.width;
                _size.g = node_.width;
            }
        }
        else {
            node_.x = node_.left;
            node_.y = node_.top;
        }
        return;
    },
    showBorder: function(node_) {
        if (!this.OpenDebug) {
            return;
        }
        debug_color_index++;
        if (debug_color_index >= debug_colors.length) {
            debug_color_index = 0;
        }
        var _position = getComputedStyle(node_.$ele, null).position,
            _color = debug_colors[debug_color_index],
            _name = document.createElement('div'), _title, _width;
        if (1 === this.OpenDebug) {
            _title = node_.name + ' ' + node_.width + '*' + node_.height;
        }
        else {
            _title = node_.name + ' ' + node_.left + ',' + node_.top;
        }
        _width = _title.length*9;
        if ('relative' != _position && 'absolute' != _position) {
            node_.$ele.style.position = 'relative';
        }
        node_.$ele.style.boxSizing = 'border-box';
        node_.$ele.style.border = '2px solid ' + _color;
        _name.style.position = 'absolute';
        _name.style.top = '0px';
        _name.style.fontSize = '14px';
        _name.style.textAlign = 'center';
        _name.style.lineHeight = 'initial';
        _name.style.left = Math.floor((node_.width-_width)/2) + 'px';
        _name.style.width = _width + 'px';
        _name.style.height = '20px';
        _name.style.color = '#ffffff';
        _name.style.backgroundColor = _color;
        _name.innerHTML = _title;
        node_.$ele.appendChild(_name);
    },
    buildPostStypeString: function(x_, y_) {
        if (1 == this.moveType) {
            return '-webkit-transform:translate3d(\'+(' + x_ + '||0)+\'px,\'+(' + y_ + '||0)+\'px,0px)';
        }
        else {
            return 'left:\'+(' + x_ + '||0)+\'px;top:\'+(' + y_ + '||0)+\'px';
        }
    },
    setScrollStyle: function(node_, attr_) {
        if (1 == this.moveType) {
            return node_.$scroll.style.webkitTransform = 'translate3d(' + (node_.scrollX||0) + 'px,' + (node_.scrollY||0) + 'px,0px)';
        }
        else if ('x' == attr_) {
            return node_.$scroll.style.left =  node_.scrollX + 'px';
        }
        else {
            return node_.$scroll.style.left =  node_.scrollY + 'px';
        }
    }
};