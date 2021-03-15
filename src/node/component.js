var FocusNode = require('./node');
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
            throw new TypeError('The each attribute of the Focus must be an array');
        }
    }
}

function Component(temp_) {
    this.template = temp_;
    this.subComps = {};
    this.subTemps = {};
    this.listener = {};
    this.name='root';
    this.render = function() {return ''};
}

Component.prototype.createInstance = function(options_) {
    options_.render = this.render;
    options_.name = this.name;
    return new FocusNode(options_);
}
Component.prototype.createNode = function(options_, name_) {
    if (this.subComps[name_]) {
        return this.subComps[name_].createInstance(options_);
    }
    if (this.subTemps[name_]) {
        options_.render = this.subTemps[name_];
        options_.name = name_;
        return new FocusNode(options_);
    }
    return null;
}

Component.prototype.addRender = function(func_, name_) {
    if (!name_) {
        this.render = func_;
    }
    else {
        this.subTemps[name_] = func_;
    }
}

Component.prototype.addSubcomponent = function(comp_) {
    this.subComps[comp_.name] = comp_;
}

Component.prototype.addListener = function(name_, event_) {
    FocusNode.addEventListener(this.name, name_, event_);
}
Component.prototype.forEach = function(list_, mbarray_, cb_) {
    return forEach(list_, mbarray_, cb_);
}
Component.prototype.error = function(e, strat_, end_) {
    return ErrorHandler(e, this.template.substr(strat_, end_-strat_), ErrorHandler.ERROR_RUN);
}
module.exports = Component;
