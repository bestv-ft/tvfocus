var Compiler = require('../src/compiler/compiler');
module.exports = function(source) {
    var _cp = new Compiler(), _temps = /<template>([\w\W]*?)<\/template>/g.exec(source);
    var _funcs = _cp.exec(_temps[1]);
    var _script = /<script.*?>([\w\W]*?)<\/script>/g.exec(source);
    var _compReg = /import\s+(\S+)\s+from\s+(\S+?)['";]+/g;
    var _compnames = {};
    var _header = ['import Component from \'tvfocus/node/component\';'];
    var _out = [];
    _out.push('var $Runtime = new Component(' + JSON.stringify(_temps[1])  + ');');
    _out.push('$Runtime.addRender(' + _funcs[0] + ')');
    for (var i in _funcs[1]) {
        if (!_compnames[i]) {
            _out.push('$Runtime.addRender(' + _funcs[1][i] + ', \'' + i + '\')');
        }
    }
    if (_script) {
        var _subcomps = _compReg.exec(_script[1]);
        while (_subcomps) {
            _header.push(_subcomps[0]);
            if (/\.focus$/.test(_subcomps[2])) {
                _compnames[_subcomps[1]] = true;
            }
            _subcomps = _compReg.exec(_script[1]);
        }
        _script = _script[1].replace(_compReg, '');
        _script = 'var options = (function () {' + _script.replace(/export\s+default/, 'return') + '})()';
        _out.push(_script);
        for (var i in _compnames) {
            _out.push(i + '.setName(\'' + i + '\')');
            _out.push('$Runtime.addSubcomponent(' + i + ')');
        }
        _out.push('for (var e in options) {$Runtime.addListener(e,options[e])}');
    }
    _out.push('export default $Runtime;');
    _header.push(_out.join('\r\n'));
    return _header.join('\r\n');
};
