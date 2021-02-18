module.exports = {
    up:function(origin_, target_) {
        if (target_.top + target_.height <= origin_.top) {
            return true;
        }
        if (target_.top + target_.height/2 < origin_.top + origin_.height/2) {
            return true;
        }
        return false;
    },
    down:function(origin_, target_) {
        if (origin_.top + origin_.height <= target_.top) {
            return true;
        }
        if (origin_.top + origin_.height/2 < target_.top + target_.height/2) {
            return true;
        }
        return false;
    },
    left:function(origin_, target_) {
        if (target_.left + target_.width <= origin_.left) {
            return true;
        }
        if (target_.left - target_.width/2 < origin_.left - origin_.width/2) {
            return true;
        }
        return false;
    },
    right:function(origin_, target_) {
        if (origin_.left + origin_.width <= target_.left) {
            return true;
        }
        if (origin_.left - origin_.width/2 < target_.left - target_.width/2) {
            return true;
        }
        return false;
    }
}
