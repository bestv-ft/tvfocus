require('./utils/polyfill');
var FocusNode = require('./node/node');
var Compiler = require('./compiler/index');
var Const = require('./utils/const');
var Layout = require('./layout');
var UI = require('./ui');
var Finder = require('./finder');
var ErrorHandler = require('./error/handler');
var TVFocus = {
    node:null,
    locked : 0, //TODO处理锁定逻辑
    createNode : function (opts_) {
        if (!opts_) {
            return;
        }
        var _ele = document.querySelector(opts_.ele), _temp;
        if (!_ele) {
            throw new ErrorHandler('Template element not find, query by \'' + opts_.ele + '\'');
        }
        opts_.ele = _ele;
        if (_ele.id) {
            opts_.name = _ele.id;
        }
        _temp = opts_.template || _ele.innerHTML;
        if (_temp) {
            opts_.render = Compiler(_temp);
        }
        else {
            opts_.render = function(){return ''};
        }
        return new FocusNode(opts_);
    },
    init : function (node_) {
        if (!node_) {
            throw new Error('init FocusNode is empty');
        }
        if (node_ instanceof FocusNode) {
            this.node = node_;
        }
        else if ('string' == typeof(node_)) {
            this.node = FocusNode.querySelecter(node_);
            if (!this.node) {
                return false;
            }
        }
        else {
            this.node = this.createNode(node_);
        }
        this.node.dispatch('on');
        return true;
    },
    getNodeById : function (id_) {
        return FocusNode.querySelecter(id_);
    },
    change : function (node_, dir_) {
        if (!(node_ instanceof FocusNode)) {
            return false;
        }
        if (this.node) {
            if (dir_) {
                var _e = this.node.dispatch('border', {dir:dir_, new_node:node_});
                if (_e.defaultPrevented) {
                    return false;
                }
            }
            this.node.dispatch('blur', {dir:dir_, new_node:node_});
        }
        this.node = node_;
        this.node.dispatch('on', {dir:dir_});
        return true;
    },
    setting : function(obj_) {
        if (obj_.debug) {
            Layout.OpenDebug = obj_.debug;
        }
        if (2 == obj_.moveType) {
            Layout.moveType = 2;
        }
        if (obj_.ui) {
            FocusNode.addDefaultEventListener('on', function(e) {
                if (this.children) {
                    return;
                }
                var _post = this.getPost();
                UI.on(this.width,this.height,_post.left, _post.top);
            });
        }
    },
    hideUI : function(obj_) {
        UI.hide();
    },
    addEventListener : function (name_, event_, cb_) {
        if ('object' === typeof(event_)) {
            for (var i in event_) {
                FocusNode.addEventListener(name_, i, event_[i]);
            }
        }
        else if ('function' === typeof(cb_)) {
            FocusNode.addEventListener(name_, event_, cb_);
        }
    },
    moveTo:function(dir_) {
        if (!this.node) {
            return;
        }
        var _node = Finder.getNext(this.node, dir_);
        if (!_node) {
            this.node.dispatch('border', {dir:dir_});
        }
        else {
            this.change(_node, dir_);
        }
    }
}

FocusNode.addDefaultEventListener('destroy', function(e) {
    if (this.id == TVFocus.node.id) {
        var _id = TVFocus.node.id;
        setTimeout(function () {
            TVFocus.node = FocusNode.querySelecter(_id);
            if (!TVFocus.node) {
                throw new Error('current FocusNode has been deleted, id:' + _id);
            }
        }, 0);
    }
});

module.exports = TVFocus;

