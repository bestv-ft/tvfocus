/**
 * token类型分为
 * String：单纯字符串
 * Statement：语句(条件或循环)
 * Expression：变量或表达式
 * Focus：光标节点
 * @param {string} type_ token的类型
 * @param {string} name_ 根据正则匹配生成的伪代码
 */
function Token (type_, name_) {
    this.type = type_;
    this.name = name_;
    this.code = '';
    this.space = null;
    this.subspace = null;
}

Token.prototype.addSpace = function(space_) {
    this.space = space_;
}

Token.prototype.addSubspace = function(space_) {
    this.subspace = space_;
}

/**
 * 
 * @param {string} code_ 未加工的渲染代码
 */
Token.prototype.parse = function(code_) {
    switch (this.name) {
        case 'closeIf':
        case 'closeEach':
        case 'closeFocus':
        case 'focus':
            this.code = '';
            break;
        case 'else':
            this.code = '}else {';
            break;
        case 'string':
            this.code = code_;
            break;
        case 'each':
            this.code = '$Runtime.forEach(' + this._parseStr(code_) + ',';
            break;
        case 'focusEach':
            this.code = '$Runtime.forEach(' + this._parseStr(code_) + ', true, ';
            break;
        case 'if':
            this.code = 'if (' + this._parseStr(code_) + ') {';
            break;
        default:
            this.code = this._parseStr(code_);
    }
}

/**
 * 
 * @param {string} attrs_ 未加工的Focus属性
 */
Token.prototype.parseFocus = function(attrs_) {
    var _attr, _data = attrs_['data'].value;
    for (var _name in attrs_) {
        _attr = attrs_[_name];
        if ('Variable' == _attr.type) {
            _attr.value = this._parseStr(_attr.value.replace(/\$self/g, _data));
            if ('style' == _name) {
                _attr.type = 'mixed';
                _attr.value = {
                    'cssTextV':{
                        'value':_attr.value,
                        'type':'Variable'
                    }
                }
            }
        }
        else {
            if ('layout' == _name) {
                if ('def' == _attr.value || 'default' == _attr.value) {
                    _attr.type = 'mixed';
                    _attr.value = {};
                }
                else if ('auto' == _attr.value || !_attr.value) {
                    attrs_[_name] = undefined;
                }
                else {
                    _attr.type = 'mixed';
                    _attr.value = this._parseStyle(_attr.value, _data);
                }
            }
            else if ('style' == _name) {
                //拆解样式或布局属性
                _attr.type = 'mixed';
                _attr.value = this._parseStyle(_attr.value, _data);
            }
        }
    }
    //补全style属性，因为其必须
    if (!attrs_['style']) {
        attrs_['style'] = {type:'mixed', value:{}};
    }
    //同步style属性的宽和高至layout
    if (attrs_['layout'] && 'mixed' == attrs_['style'].type) {
        var _layout = attrs_['layout'].value, _style = attrs_['style'].value;
        if (undefined === _layout['width'] && _style.width && 'px' == _style.width.unit) {
            _layout['width'] = _style.width;
        }
        if (undefined === !_layout['height'] && _style.height && 'px' == _style.height.unit) {
            _layout['height'] = _style.height;
        }
    }
    return attrs_;
}

/**
 * 将可能的变量或表达式中的，局部变量加上data_前缀，以匹配render函数的data_入参
 * 排除掉 全局函数、JS内置对象、(单双引号)字符串、数字、JS保留字、对象的子属性、已申明空间内变量
 * 匹配规则：开头：前面必须是'顶头'或不是'广义字母(\w)、不是点、不是双引号、不是单引号'。 ---排除(单双引号)字符串、数字、对象的子属性
 * 匹配规则：捕获：符合JS变量命名规范的字符串。
 * @param {String} str_ 原始字符串
 */
Token.prototype._parseStr = function(str_) {
    var _ret = '', 
        _test = /[^\w\."']([a-zA-Z$_.]{1}[0-9a-zA-Z$_]*)/g,
        _head = 1, 
        _end = 0,_len, _ignore, _p, _pp, _v;
    str_ = ' ' + str_;
    _p = _test.exec(str_);
    _len = str_.length;
    _ignore = this.space.variables;
    while (null !== _p) {
        _pp = _p[1], _v = '';
        if ('$data' == _pp || '.' == _pp) {
            _v = '$data';
        }
        else if (-1 < _ignore.indexOf(_pp)) {
            _v = _pp;
        }
        else if (/\b(Array|Date|Object|String|new|Math|NaN|undefined|null|true|false|Number|JSON|instanceof|typeof)\b/.test(_pp)) {
            _v = _pp;
        }
        else{
            _v = '$data.' + _pp;
        }
        _end = _p.index + 1;
        if (_head < _end) {
            _ret += str_.substr(_head, _end - _head);
        }
        _head = _test.lastIndex;
        _ret += _v;
        _p = _test.exec(str_);
    }
    if (_head != _len) {
        _ret += str_.substr(_head, _len - _head);
    }
    return _ret || str_;
}

/**
 * 拆解样式或布局。
 * @param {String} str_ 原始字符串
 */
Token.prototype._parseStyle = function(str_, data_) {
    var _styles = {}, _that = this;
    str_.split(';').forEach(function (style_) {
        var _part = style_.split(':'), _n, _v;
        if (_part[1]) {
            _v = /({{\s*(.+?)\s*}}|\d+)(px|%|em|rem)?/.exec(_part[1]);
            _n = _part[0].trim();
            if (null !== _v) {
                if (undefined !== _v[2]) {
                    _styles[_n] = {type:'Variable', value:_that._parseStr(_v[2].replace(/\$self/g, data_)), unit:_v[3]||''};
                }
                else {
                    _styles[_n] = {type:'String', value:_v[1], unit:_v[3]||''};
                }
            }
            else {
                _styles[_n] = {type:'String', value:_part[1], unit:''};
            }
        }
    });
    return _styles;
}

module.exports = Token;