var Rule = {
    Catcher:'(?:{{\\s*(.+?)\\s*}})|(?:<\/?\\s*focus\\s*([\\w\\W]*?)>)|(?:<!--[\\s\\S]*?-->)',
    /**
     * 解析模板内的字符串
     * @param {string} value_ 
     * @param {Contextspace} space_ 
     */
    parseString: function(value_, space_) {
        return space_.addToken('String', 'string', value_);
    },

    /**
     * 解析模板内的变量和表达式
     * @param {string} value_ 
     * @param {Contextspace} space_ 
     */
    parseStatement: function(value_, space_) {
        if ('/if' == value_) {
            return space_.addToken('Statement', 'closeIf');
        }
        else if ('/each' == value_) {
            return space_.addToken('Statement', 'closeEach');
        }
        else if ('if ' == value_.substr(0,3)) {
            return space_.addToken('Statement', 'if', value_.substr(3, value_.length-1));
        }
        else if ('else' == value_.substr(0,4)) {
            return space_.addToken('Statement', 'else');
        }
        else if ('else if ' == value_.substr(0,8)) {
            return space_.addToken('Statement', 'elseIf', value_.substr(8, value_.length-1));
        }
        else if ('each ' == value_.substr(0,5)) {
            return space_.addToken('Statement', 'each', value_.substr(5, value_.length-1));
        }
        else {
            return space_.addToken('Expression', 'expression', value_);
        }
    },
    /**
     * 解析Focus节点，捕获属性
     * 直接量属性值，必须用双引号包裹
     * 变量属性值，双花括号包裹，外层双引号可有可无
     * 允许不带值的属性，类似DOM属性中的disabled\checked
     * focus的属性值，要么是直接量(字符串或数字) 要么是表达式，不能混搭
     * 特殊属性：each，属性值只接受变量
     * 特殊属性：style，layout，单个样式属性值可以接受纯变量或纯字符串
     * focus的属性值，此处只做匹配，不做格式校验
     * @param {string} temp_ 正则命中的原始字符串
     * @param {string} value_ 子规则匹配到的字符串
     * @param {string} space_ 当前按作用域
     */
    parseFocus: function(temp_, value_, space_) {
        if ('</' == temp_.substr(0,2)) {
            return space_.addToken('Focus', 'closeFocus');
        }
        var _test = /([a-zA-Z\-_]+)(?:\s*=\s*(?:(?:"([\w\W]*?)")|(?:{{([\S ]+?)}})))?/g,
            _p = _test.exec(value_),
            _attrs = {},_each = '', _name, _v, _t;
        //拆解光标属性
        while(null != _p) {
            _name = _p[1];
            //each属性会在focus之上额外生成一层each，并增加space。
            if ('each' == _name) {
                _each = _p[3] || _p[2].replace(/{{|}}/g, '');
            }
            else if (_p[3]) {
                _attrs[_name] = {type:'Variable',value:_p[3]};
            }
            else {
                _v = /^{{([\S ]+?)}}$/.exec(_p[2]);
                if (null !== _v) {
                    _attrs[_name] = {type:'Variable',value:_v[1]};
                }
                else if ('data' == _name || 'each' == _name) {
                    _attrs[_name] = {type:'Variable',value:_p[2]};
                }
                else {
                    _attrs[_name] = {type:'String',value:_p[2]};
                }
            }
            _p = _test.exec(value_);
        }
        if (undefined == _attrs['name']) {
            if (undefined != _attrs['class'] && 'String' == _attrs['class'].type) {
                _attrs['name'] = {type:'String',value:_attrs['class'].value.replace(/ +/g,'_')};
            }
        }
        if (undefined === _attrs['name']) {
            throw new Error('focus tag need \'name\' attribute');
        }
        //属性值的格式检查
        if ('String' !== _attrs['name'].type) {
            throw new Error('\'name\' attribute must be a string');
        }
        if (_attrs['layout'] && 'Variable' === _attrs['layout'].type) {
            throw new Error('\'layout\' attribute value cannot be a variable');
        }
        if (_attrs['scroll']) {
            if ('Variable' === _attrs['scroll'].type) {
                throw new Error('\'scroll\' attribute value cannot be a variable');
            }
            if (!_attrs['scroll'].value) {
                _attrs['scroll'].dir = 'x';
                _attrs['scroll'].value = 0;
            }
            var _p = /^(x|y|auto)(?::(?:(-?\d+)|(?:{{\s*(.+?)\s*}})))?$/.exec(_attrs['scroll'].value);
            if (!_p) {
                throw new Error('\'scroll\' attribute value error');
            }
            else {
                _attrs['scroll'].dir = _p[1];
                if (undefined !== _p[3]) {
                    _attrs['scroll'].type = 'Variable';
                    _attrs['scroll'].value = _p[3];
                }
                else {
                    _attrs['scroll'].value = _p[2] || 0;
                }
            }
        }
        if (undefined == _attrs['data']) {
            if (_each) {
                _attrs['data'] = {type:'Variable',value:'$value'};
            }
            else {
                _attrs['data'] = {type:'Variable',value:_attrs['name'].value};
            }
        }
        if (_each) {
            _t = space_.addToken('Statement', 'focusEach', _each);
            _t = _t.subspace.addToken('Focus', 'focus', _attrs);
            //如果是群组成员，则能够共享很多布局信息。
        }
        else {
            _t = space_.addToken('Focus', 'focus', _attrs);
        }
        return _t;
    }
}

module.exports = Rule;
