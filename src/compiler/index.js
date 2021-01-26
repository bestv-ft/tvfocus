var Compiler = require('./compiler');

module.exports = function (tpl_) {
    var _cp = new Compiler();
    return _cp.exec(tpl_);
}
