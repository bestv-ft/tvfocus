var Token = require('./token');

/**
 * 创建一个上下文空间
 * @param {Object} p_  此空间的父空间，顶层空间的父空间为null
 * @param {String} t_  空间类型，目前只有Focus和Each、If，默认为Focus
 */
function Contextspace(p_, t_) {
    this.parent = p_||null;
    this.tokens = [];
    this.type = t_ || 'Focus';
    this.variables = [];
    this.attributes = [];
    this.start = 0;
    this.end = 0;
}

Contextspace.prototype.setAttributes = function(attrs_) {
    this.attributes = attrs_;
}

Contextspace.prototype.setVariables = function(vars_) {
    this.variables = vars_;
}

Contextspace.prototype.addVariable = function(k_) {
    for (var i = 0; i < this.variables.length; i++) {
        if (this.variables[i] == k_) {
            return;
        }
    }
    this.variables.push(k_);
}

Contextspace.prototype.addToken = function(type_, name_, code_) {
    code_ = code_ || '';
    var _t = new Token(type_, name_)
    this.tokens.push(_t);
    _t.addSpace(this);
    if ('if' == _t.name) {
        var _s = new Contextspace(this, 'If');
        _t.addSubspace(_s);
    }
    else if ('each' == _t.name) {
        var _part = code_.split(/[ \t]+/);
        var _s = new Contextspace(this, 'Each');
        var _len;
        if ('' == _part[0]) {
            _part.shift();
        }
        _len = _part.length;
        code_ = _part[0];
        if (2 > _len) {
            _part[1] = '$value';
        }
        if (3 > _len) {
            _part[2] = '$index';
        }
        _s.addVariable(_part[1]);
        _s.addVariable(_part[2]);
        _t.addSubspace(_s);
    }
    else if ('focusEach' == _t.name) {
        var _s = new Contextspace(this, 'FocusEach');
        _s.addVariable('$value');
        _s.addVariable('$index');
        for (var i = 0; i < this.variables.length; i++) {//合并上级空间的局部变量
            _s.addVariable(this.variables[i]);
        }
        _t.addSubspace(_s);
    }
    else if ('focus' == _t.name) {
        var _s = new Contextspace(this, 'Focus');
        _s.setAttributes(_t.parseFocus(code_));
        _t.addSubspace(_s);
    }
    _t.parse(code_);
    return _t;
}
module.exports = Contextspace;