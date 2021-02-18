module.exports = {
    up:function(origin_, target_) {
        if (target_.top + target_.height <= origin_.top) {
            return 1;
        }
        if (target_.top + target_.height/2 < origin_.top + origin_.height/2) {
            return 2;
        }
        return false;
    },
    down:function(origin_, target_) {
        if (origin_.top + origin_.height <= target_.top) {
            return 1;
        }
        if (origin_.top + origin_.height/2 < target_.top + target_.height/2) {
            return 2;
        }
        return false;
    },
    left:function(origin_, target_) {
        if (target_.left + target_.width <= origin_.left) {
            return 1;
        }
        if (target_.left + target_.width/2 < origin_.left + origin_.width/2) {
            return 2;
        }
        return false;
    },
    right:function(origin_, target_) {
        if (origin_.left + origin_.width <= target_.left) {
            return 1;
        }
        if (origin_.left + origin_.width/2 < target_.left + target_.width/2) {
            return 2;
        }
        return false;
    }
}
