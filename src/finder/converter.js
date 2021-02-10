function VirtualNode(node_, target_, top_, left_) {
    this.realnode = node_;
    this.parent = target_;
    this.width = node_.width;
    this.height = node_.height;
    this.top = top_;
    this.left = left_;
}

VirtualNode.prototype.getRect = function() {
    return {
        width:this.width,
        height:this.height,
        left:this.left,
        top:this.top
    };
}

module.exports = {
    mapIn:function(origin_, target_) {
        var _c = origin_.getRect(), _p = target_.getRect(), _vnode;
        _vnode = new VirtualNode(origin_, target_, _c.top - _p.top, _c.left - _p.left);
        _vnode.fingerprint = origin_.fingerprint;
        _vnode.maping = 'in';
        return _vnode;
    },
    mapOut:function(origin_) {
        var _c = origin_.getRect(), _p = origin_.parent.getRect(), _vnode;
        _vnode = new VirtualNode(origin_, origin_.parent.parent, _c.top + _p.top, _c.left + _p.left);
        _vnode.fingerprint = origin_.parent.fingerprint;
        _vnode.maping = 'out';
        return _vnode;
    }
}
