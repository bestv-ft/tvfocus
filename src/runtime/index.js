var ErrorHandler = require('../error/handler');
function forEach (list_, mbarray_, cb_) {
    if (true !== mbarray_) {
        cb_ = mbarray_;
        mbarray_ = false;
    }
    if (list_ instanceof Array) {
        for (var i=0,l=list_.length; i<l; i++) {
            cb_(list_[i], i);
        }
    }
    else {
        if (!mbarray_) {
            for (var i in list_) {
                cb_(list_[i], i);
            }
        }
        else {
            throw new TypeError('The each attribute of the Focue must be an array');
        }
    }
}
function Runtime (temp_) {
    this.temp = temp_;
    this.renderFuncs = {};
}
Runtime.prototype.addFocusRender = function(name_, cb_) {
    this.renderFuncs[name_] = cb_;
}
Runtime.prototype.forEach = function(list_, mbarray_, cb_) {
    return forEach(list_, mbarray_, cb_);
}
Runtime.prototype.error = function(e, strat_, end_) {
    return ErrorHandler(e, this.temp.substr(strat_, end_-strat_), ErrorHandler.ERROR_RUN);
}

module.exports = Runtime;
