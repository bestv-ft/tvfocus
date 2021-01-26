var Rule = require('./rule');
var Assembler = require('./assembler');
var Contextspace = require('./contextspace');
var Runtime = require('../runtime');
var FocusNode = require('../node/node');
var ErrorHandler = require('../error/handler');

/**
 * 编译器构造函数
 * 每创建新的编译器，都会初始化编译环境
 */
function Compiler() {
    this.space = new Contextspace();
    this.pointer = this.space;
}

/**
 * 解析模板
 * @param {String}} str_ 
 * @returns {Function} 渲染函数
 */
Compiler.prototype.exec = function(str_) {
    var _r = new RegExp(Rule.Catcher,'ig'), _m=_r.exec(str_),
        _token, _head = 0, _len = str_.length, _rumtime = new Runtime(str_);
    while (null !== _m) {
        //_m数组说明：0是匹配到的字符串，1是大括号内的变量，2是focus的属性值
        if (_head < _m.index) {
            Rule.parseString(str_.substr(_head, _m.index - _head), this.pointer);
        }
        if (undefined !== _m[1]) {
            _token = Rule.parseStatement(_m[1], this.pointer);
        }
        else if (undefined !== _m[2]) {
            try {
                _token = Rule.parseFocus(_m[0], _m[2], this.pointer);
            }
            catch (e) {
                throw ErrorHandler(e, str_.substr(_m.index), ErrorHandler.ERROR_COMPILE);
            }
        }
        else {
            //捕获到注释，生成空_token
            _token = {};
        }
        //如果生成的token，有新的命名空间，则将当前的空间指针指向新空间
        if (_token.subspace) {
            this.pointer = _token.subspace;
            this.pointer.start = _m.index;
        }
        else if ('closeEach' == _token.name || 'closeFocus' == _token.name || 'closeIf' == _token.name) {
            //function结束，命名空间完结，指针前移
            this.pointer.end = _r.lastIndex - 1;
            if ('closeFocus' == _token.name && 'FocusEach' == this.pointer.parent.type) {
                //如果是带each属性的focus，补齐closeEach，指针再次前移
                this.pointer.parent.end = this.pointer.end;
                this.pointer.parent.start = this.pointer.start;
                this.pointer = this.pointer.parent;
                this.pointer.addToken('Statement', 'closeEach');
            }
            this.pointer = this.pointer.parent;
        }
        _head = _r.lastIndex;
        _m=_r.exec(str_);
    }
    if (_head != _len) {
        Rule.parseString(str_.substr(_head, _len - _head), this.pointer);
    }
    if (null !== this.pointer.parent) {
        var _brackets = '';
        if ('Focus' == this.pointer.type) {
            _brackets = '<' + this.pointer.type + '>';
        }
        else {
            _brackets = '{{' + this.pointer.type + '}}';
        }
        throw ErrorHandler(_brackets + ' tag is not closed', str_.substr(this.pointer.start), ErrorHandler.ERROR_COMPILE);
    }
    else {
        this.pointer.end = _len - 1;
    }
    var _funcs = Assembler.build(this.space);
    for (var i in _funcs[1]) {
        _rumtime.addFocusRender(i, new Function('$Runtime', 'FocusNode', 'return ' + _funcs[1][i])(_rumtime, FocusNode));
    }
    return new Function('$Runtime', 'FocusNode', 'return ' + _funcs[0])(_rumtime, FocusNode);
}

module.exports = Compiler;
