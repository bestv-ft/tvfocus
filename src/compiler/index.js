var Component = require('../node/component');
var Compiler = require('./compiler');

module.exports = function (tpl_) {
    var _cp = new Compiler(), _comp = new Component(tpl_), _funcs = _cp.exec(tpl_);
    for (var i in _funcs[1]) {
        _comp.addRender(new Function('$Runtime', 'return ' + _funcs[1][i])(_comp), i);
    }
    _comp.addRender(new Function('$Runtime', 'return ' + _funcs[0])(_comp));
    console.log(_funcs);
    return _comp;
}
