function updownCheck (origin_, target_) {
    if (target_.left + target_.width  < origin_.left) {
        return false;
    }
    if (target_.left > origin_.left + origin_.width) {
        return false;
    }
    if (target_.left <= origin_.left && target_.left + target_.width >= origin_.left + origin_.width) {
        return true;
    }
    if (target_.left >= origin_.left && target_.left + target_.width <= origin_.left + origin_.width) {
        return true;
    }
    return false;
}

function leftrightCheck (origin_, target_) {
    if (target_.top + target_.height < origin_.top) {
        return false;
    }
    if (target_.top > origin_.top + origin_.height) {
        return false;
    }
    if (target_.top <= origin_.top && target_.top + target_.height >= origin_.top + origin_.height) {
        return true;
    }
    if (target_.top >= origin_.top && target_.top + target_.height <= origin_.top + origin_.height) {
        return true;
    }
    return false;
}

module.exports = {
    up:function(origin_, target_) {
        return updownCheck(origin_, target_);
    },
    down:function(origin_, target_) {
        return updownCheck(origin_, target_);
    },
    left:function(origin_, target_) {
        return leftrightCheck(origin_, target_)
    },
    right:function(origin_, target_) {
        return leftrightCheck(origin_, target_)
    }
}
