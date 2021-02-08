var Layout = require('../layout');
var uuid = require('../utils/uuid');
var NodeMap = {};
var NodeHashMap = {};
var NodeSelectedList = {};
var EventListener = {};
var DefaultEventListener = {};
var MessageListener = {};
var Dom = require('../utils/polyfill');

function FocusEvent (data_) {
    this.defaultPrevented = false;
    this.propagationStopped = false;
    this.data = data_ || {};
}
FocusEvent.prototype.preventDefault = function() {
    this.defaultPrevented = true;
}
FocusEvent.prototype.stopPropagation = function() {
    this.propagationStopped = true;
}

/**
 * @param options {
 *      data:'节点渲染所需的data'
 *      render:'渲染函数'
 *      ele:挂载的dom元素
 *      id:'节点的ID，用于速查'
 *      disabled:'节点是否生效'
 *      cache:'节点是否能持久选中'
 *      name:'节点的名称'
 *      layout: {
 *          width:宽
 *          height:高
 *          left:左
 *          top:顶
 *      }
 *      scrollX:左右滑动
 *      scrollY:上下滑动
 *      width:宽
 *      height:高
 *      left:左
 *      top:顶
 *      scrollX:左右滑动
 *      scrollY:上下滑动
 *      ext_data:扩展数据
 * }
 */
function FocusNode(options_) {
    this.disabled = options_.disabled || 0;
    if (undefined !== options_.cache) {
        this.cacheID = options_.cache;
    }
    this.data = {};
    this.tags = [];
    this.focus_data = [];
    this.$data = options_.data || {};
    this.name = options_.name || 'root';
    this.$ele = null;
    this.$render = options_.render;
    this.scrollY = options_.scrollY;
    this.scrollX = options_.scrollX;
    if (undefined !== options_.layout) {
        this.$layout = options_.layout;
    }
    if (undefined !== options_.ext_data) {
        for (var k in options_.ext_data) {
            this.$data[k] = options_.ext_data[k];
        }
    }
    this.select = 0;
    this.selectDelay = 500;
    this.status = 0;
    this.fingerprint = uuid();
    NodeHashMap[this.fingerprint] = this;
    options_.id && this.setId(options_.id);
    //@XXX created事件内，id属性可能为空，但是可以在事件内定义setId属性。
    this.dispatch('created', this.$data);
    if (options_.ele) {
        options_.ele.innerHTML = this.render();
        this.mount(options_.ele);
    }
}

FocusNode.prototype.render = function() {
    if (undefined !== this.index) {
        this.$data.$index = this.index;
    }
    return this.$render.call(this, this.$data);
}

/**
 * 重新渲染
 * @param {Object} data_ 新的数据
 */
FocusNode.prototype.rerender = function(data_) {
    var _old;
    if (this.children) {
        this.children.forEach(function(n_){
            n_.destroy();
        });
        _old = this.children;
        this.children = undefined;
    }
    var _inner = this.$render.call(this, data_);
    if (this.$scroll) {
        this.$scroll.innerHTML = _inner;
        if (undefined !== this.scrollX) {
            this.$calcSize = {};
        }
    }
    else {
        this.$ele.innerHTML = _inner;
    }
    if (this.children) {
        var _that = this;
        this.children.forEach(function(n_){
            n_.mount(Dom.querySelector('#' + n_.fingerprint, _that.$ele));
        });
    }
    if (this.$calcSize && this.$calcSize.x) {
        //如果是横向滚动的布局，则同步滚动条的宽度。
        this.$scroll.style.width = (this.$calcSize.x + this.$calcSize.g) + 'px';
        this.$calcSize = undefined;
    }
}

FocusNode.prototype.mount = function(ele_) {
    this.$ele = ele_;
    Layout.calcSpace(this);
    if (undefined !== this.scrollY || undefined !== this.scrollX) {
        this.$scroll = this.$ele.firstElementChild;
    }
    if (undefined !== this.scrollX) {
        this.$calcSize = {};
    }
    if (this.children) {
        var _that = this, _len = this.children.length;
        this.children.forEach(function(n_, i_) {
            n_.mount(Dom.querySelector('#' + n_.fingerprint, _that.$ele));
        });
    }
    if (!this.height) {
        throw new Error('Focus ' + this.name + ' not set height');
    }
    if (!this.id) {
        this.setId();
    }
    if (this.$calcSize && this.$calcSize.x) {
        //如果是横向滚动的布局，则同步滚动条的宽度。
        this.$scroll.style.width = (this.$calcSize.x + this.$calcSize.g) + 'px';
        this.$calcSize = undefined;
    }
    Layout.showBorder(this);
    this.dispatch('mounted', this.$data);
    for (var i = this.focus_data.length; i >= 0; i--) {
        if (this.$data[this.focus_data[i]]) {
            this.data[this.focus_data[i]] = this.$data[this.focus_data[i]];
        }
    }
    this.$data = undefined;
    this.$layout = undefined;
}

FocusNode.prototype.dispatch = function(name_, data_) {
    var _e = (data_ instanceof FocusEvent) ? data_ : new FocusEvent(data_);
    if (!_e.propagationStopped) {
        if (EventListener[this.name] && EventListener[this.name][name_]) {
            EventListener[this.name][name_].call(this, _e);
        }
        for (var i = this.tags.length; i >=0; i--) {
            if (EventListener['$__' + this.tags[i]] && EventListener['$__' + this.tags[i]][name_]) {
                EventListener['$__' + this.tags[i]][name_].call(this, _e);
            }
        }
        if (false === _e.defaultPrevented && EventListener['$'] && EventListener['$'][name_]) {
            EventListener['$'][name_].call(this, _e);
        }
    }
    if (!_e.defaultPrevented) {
        if (DefaultEventListener[name_]) {
            DefaultEventListener[name_].call(this, _e);
        }
    }
    if ('on' == name_) {
        this.status = 1;
        if (this.parent && this.status != this.parent.status) {
            //向上冒泡
            this.parent.dispatch(name_, _e);
        }
        if (!this.children) {
            var _that = this;
            setTimeout(function () {
                if (1 == _that.status && 0 == _that.select) {
                    if (_that.cacheID) {
                        if (NodeSelectedList[_that.cacheID]) {
                            NodeSelectedList[_that.cacheID].select = 0;
                            NodeSelectedList[_that.cacheID].dispatch('unselected', new FocusEvent());
                        }
                        NodeSelectedList[_that.cacheID] = _that;
                    }
                    _that.select = 1;
                    _that.dispatch('selected', new FocusEvent());
                }
            }, this.selectDelay);
        }
    }
    else if ('blur' == name_ || 'border' == name_) {
        if ('blur' == name_) {
            if (1 == this.select && !this.cacheID) {
                this.dispatch('unselected', new FocusEvent());
                this.select = 0;
            }
            this.status = 0;
        }
        if (!this.parent) {
            return _e;
        }
        var _ancestor = _e.data.new_node.parent;
        //将new_node祖先遍历一遍，如果没有发现this.parent，则表示this.parent也失焦了
        while(_ancestor) {
            if (_ancestor.fingerprint === this.parent.fingerprint) {
                break;
            }
            _ancestor = _ancestor.parent;
        }
        if (!_ancestor) {
            this.parent.dispatch(name_, _e);
        }
    }
    return _e;
}
FocusNode.prototype.getPost = function() {
    var _p = {top:0,left:0};
    if (this.parent) {
        _p = this.parent.getPost();
    }
    return {
        top : this.top+_p.top+(this.scrollY||0),
        left : this.left+_p.left+(this.scrollX||0)
    }
}
FocusNode.prototype.markFocusData = function(key_) {
    if (key_ instanceof Array) {
        this.focus_data = key_;
    }
    else {
        this.focus_data.push(key_);
    }
}
FocusNode.prototype.onMessage = function(name_, cb_) {
    if (!MessageListener[name_]) {
        MessageListener[name_] = {};
    }
    MessageListener[name_][this.id] = cb_;
}
FocusNode.prototype.postMessage = function(name_, data_, id_) {
    if (MessageListener[name_]) {
        if (id_) { //点对点消息
            if (NodeMap[id_] && MessageListener[name_][id_]) {
                MessageListener[name_][id_].call(NodeMap[id_], {source:this,data:data_});
            }
        }
        else { //广播消息
            for (var _m in MessageListener[name_]) {
                MessageListener[name_][_m].call(NodeMap[_m], {source:this,data:data_});
            }
        }
    }
}
FocusNode.prototype.getEle = function() {
    return this.$ele;
}
FocusNode.prototype.addTag = function(tag_) {
    if (-1 === this.tags.indexOf(tag_)) {
        this.tags.push(tag_);
    }
}
FocusNode.prototype.addChild = function (node_) {
    if (!this.children) {
        this.children = [];
    }
    node_.parent = this;
    node_.index = this.children.length;
    if (this.cacheID && !node_.cacheID) {
        node_.cacheID = this.cacheID;
    }
    this.children.push(node_);
    return node_;
}
FocusNode.prototype.setScrollX = function (x_) {
    if (!this.$scroll) {
        return false;
    }
    this.scrollX = x_;
    return Layout.setScrollStyle(this, 'x');
}
FocusNode.prototype.setScrollY = function (y_) {
    if (!this.$scroll) {
        return false;
    }
    this.scrollY = y_;
    return Layout.setScrollStyle(this, 'y');
}
FocusNode.prototype.setSelectedTime = function (t_) {
    this.selectDelay = t_;
}
FocusNode.prototype.getChildByIndex = function (index_) {
    if (!this.children) {
        return null;
    }
    if (index_ >= this.children.length) {
        return null;
    }
    return this.children[index_];
}

/**
 * 设置节点的ID，可支持两种方式：
 * 1、自定义ID，可在模板中指定任意的ID，如果有设置同名的ID则会使用方式2。
 * 2、自动生成ID，借助父节点的ID和群组index生成唯一的ID，此ID可体现光标树层级。
 * ID可用来还原历史节点等。
 * ID与指纹的区别：指纹是每个节点的唯一标识。ID是活跃节点的唯一标识，当页面发生翻页、返回等行为时。
 * 利用ID可找到离开前的节点，指纹则不可以。
 * 知道父节点的ID，可以通过name和index拼接出子节点的ID，指纹的生成则是不可逆的。
 * @param {String} id_ 
 */
FocusNode.prototype.setId = function (id_) {
    if (this.id) {
        return;
    }
    if (id_ && !NodeMap[id_]) {
        this.id = id_;
    }
    else {
        var _id = this.name;
        if (this.parent && this.parent.id) {
            _id = this.parent.id + '_' + this.index + '_' + _id;
        }
        this.id = _id;
    }
    NodeMap[this.id] = this;
}

/**
 * 销毁节点。
 * @xxx 注意回收引用，防止内存泄露
 */
FocusNode.prototype.destroy = function() {
    NodeMap[this.id] = null;
    NodeHashMap[this.fingerprint] = null;
    if (this.select && this.cacheID) {
        NodeSelectedList[this.cacheID] = null;
    }
    this.dispatch('destroy');
}

FocusNode.querySelecter=function(id_) {
    if ('#' == id_.substr(0,1)) {
        return NodeHashMap[id_.substr(1)] || null;
    }
    else {
        return NodeMap[id_] || null;
    }
}

FocusNode.addEventListener=function(name_, event_, cb_) {
    if ('#' == name_.substr(0,1)) {
        name_ = '$__' + name_.substr(1);
    }
    if (!EventListener[name_]) {
        EventListener[name_] = {};
    }
    EventListener[name_][event_] = cb_;
}
FocusNode.addDefaultEventListener=function(event_, cb_) {
    DefaultEventListener[event_] = cb_;
}
module.exports = FocusNode;
