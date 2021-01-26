function isBetterCandidate(direction, source, rect1, rect2) {
    //如果rect2不是候选人，则rect1 is better
    if (!isCandidate(source, rect2, direction)) {
        return true;
    }
    //rect1,rect2比较,如果rect1比rect2好，则rect1胜出
    if (beamBeats(direction, source, rect1, rect2)) {
        return true;
    }
    //如果rect2更好，则rect1不能胜出
    if (beamBeats(direction, source, rect2, rect1)) {
        return false;
    }
    //如果以上都没有结果，那么，根据主轴距离和次轴距离来计算
    return (getWeightedDistanceFor(majorAxisDistance(direction, source, rect1), minorAxisDistance(direction, source, rect1))
        < getWeightedDistanceFor(majorAxisDistance(direction, source, rect2), minorAxisDistance(direction, source, rect2)));
}
//寻找第一个候选节点
function findFirstCandidate(direction, source, newSource, srcPosition, focusables) {
    var findStatus = 'find';
    if (focusables.length) {
        for (var i = 0; i < focusables.length; i++) {
            
            var focusable = focusables[i];
            var focus_1 = new Position(focusable);
            //排除newSource本身
            if(focus_1.focus == newSource) {
                continue;
            }
            var rect = focus_1.formart();
            if (isCandidate(srcPosition, rect, direction)) {
                return {
                    focus: focusable,
                    index: i,
                    position: rect,
                    focusables: focusables,
                    srcPostion: srcPosition
                };
            }
        }
        
    }
    //无可选节点，一直没有找到一个节点作为第一个候选节点
    findStatus = 'not_find';
    if (findStatus == 'not_find') {
        //去节点上一层级寻找候选节点
        newSource = newSource ? newSource : source;
        if (newSource.parent) {
            //将source的父节点当做新的source节点
            newSource = new Position(newSource.parent);
            var newSrcPosition = newSource.upper(srcPosition);
            return findFirstCandidate(direction, source, newSource.focus, newSrcPosition, getBrotherFocusables(newSource.focus));
        }
        else {
            //找不到候选节点
            return false;
        }
    }
}
//判断是否focusnode是否是候选节点
function isCandidate(source, dest, direction) {
    if (dest.disabled) {
        return false;
    }
    switch (direction) {
        case 'LEFT':
            return (source.right > dest.right || source.left >= dest.right) && source.left > dest.left;
        case 'RIGHT':
            return (source.left < dest.left || source.right <= dest.left) && source.right < dest.right;
        case 'UP':
            return (source.bottom > dest.bottom || source.top >= dest.bottom) && source.top > dest.top;
        case 'DOWN':
            return (source.top < dest.top || source.bottom <= dest.top) && source.bottom < dest.bottom;
    }
    throw new Error('direction must be one of '
        + '{UP, DOWN, LEFT, RIGHT}');
}
function beamBeats(direction, source, rect1, rect2) {
    var rect1InSrcBeam = beamsOverlap(direction, source, rect1); //rect1是否在投影上
    var rect2InSrcBeam = beamsOverlap(direction, source, rect2); //rect2是否在投影上
    //如果rect2投影存在，或rect1投影不存在，则return false
    if (rect2InSrcBeam || !rect1InSrcBeam) {
        return false;
    }
    //此时rect1投影存在，rect2投影不存在。此时如果rect2不在source的方向位置，则return true，rect1胜出
    if (!isToDirectionOf(direction, source, rect2)) {
        return true;
    }
    // 水平方向上，总是return true
    if (direction == 'LEFT' || direction == 'Right') {
        return true;
    }
    //垂直方向上，判断rect2最远边的距离是否大于rect1最近边的距离。
    return (majorAxisDistance(direction, source, rect1) < majorAxisDistanceToFarEdge(direction, source, rect2));
}
function beamsOverlap(direction, rect1, rect2) {
    switch (direction) {
        case 'LEFT':
        case 'RIGHT':
            //左右方向上
            return (rect2.bottom > rect1.top) && (rect2.top < rect1.bottom);
        case 'UP':
        case 'DOWN':
            return (rect2.left < rect1.right) && (rect2.right > rect1.left);
    }
    throw new Error('direction must be one of '
        + '{UP, DOWN, LEFT, RIGHT}');
}
function isToDirectionOf(direction, source, dest) {
    switch (direction) {
        case 'LEFT':
            return source.left >= dest.right;
        case 'RIGHT':
            return source.right <= dest.left;
        case 'UP':
            return source.top >= dest.bottom;
        case "DOWN":
            return source.bottom <= dest.top;
    }
    throw new Error('direction must be one of '
        + '{UP, DOWN, LEFT, RIGHT}');
}
function getWeightedDistanceFor(_majorAxisDistance, _minorAxisDistance) {
    return 13 * _majorAxisDistance * _majorAxisDistance
        + _minorAxisDistance * _minorAxisDistance;
}
function majorAxisDistance(direction, source, dest) {
    return Math.max(0, majorAxisDistanceRaw(direction, source, dest));
}
function majorAxisDistanceRaw(direction, source, dest) {
    switch (direction) {
        case 'LEFT':
            return source.left - dest.right; //下一个节点在左边（遥控器按左键）
        case 'RIGHT':
            return dest.left - source.right; //下一个节点在右边（遥控器按右键）
        case 'UP':
            return source.top - dest.bottom; //下一个节点在上边（遥控器按上键）
        case 'DOWN':
            return dest.top - source.bottom; //下一个节点在下边（遥控器按下键）
    }
    throw new Error('direction must be one of '
        + '{UP, DOWN, LEFT, RIGHT}');
}
function majorAxisDistanceToFarEdge(direction, source, dest) {
    return Math.max(1, majorAxisDistanceToFarEdgeRaw(direction, source, dest));
}
function majorAxisDistanceToFarEdgeRaw(direction, source, dest) {
    switch (direction) {
        case 'LEFT':
            return source.left - dest.left;
        case 'RIGHT':
            return dest.right - source.right;
        case 'UP':
            return source.top - dest.top;
        case 'DOWN':
            return dest.bottom - source.bottom;
    }
    throw new Error('direction must be one of '
        + '{UP, DOWN, LEFT, RIGHT}');
}
function minorAxisDistance(direction, source, dest) {
    switch (direction) {
        case 'LEFT':
        case 'RIGHT':
            return Math.abs((source.top + source.height / 2) -
                (dest.top + dest.height / 2));
        case 'UP':
        case 'DOWN':
            return Math.abs((source.left + source.width / 2) -
                (dest.left + dest.width / 2));
    }
    throw new Error('direction must be one of '
        + '{UP, DOWN, LEFT, RIGHT}');
}
//以上都是关于节点的计算


var Position = /** @class */ (function () {
    function Position(focus) {
        this.focus = focus;
    }
    //格式化节点的位置信息
    Position.prototype.formart = function () {
        return {
            disabled: this.focus.disabled,
            left: this.focus.left + (this.focus.scrollX||0),
            right: this.focus.left + this.focus.width + (this.focus.scrollX||0),
            top: this.focus.top + (this.focus.scrollY||0),
            bottom: this.focus.top + this.focus.height  + (this.focus.scrollY||0),
            width: this.focus.width,
            height: this.focus.height
        };
    };
    //计算src节点相对srcPosition的位置信息
    Position.prototype.upper = function (srcPosition) {
        return {
            disabled: this.focus.disabled,
            left: this.focus.left + srcPosition.left + (this.focus.scrollX||0),
            right: this.focus.left + srcPosition.right + (this.focus.scrollX||0),
            top: this.focus.top + srcPosition.top + (this.focus.scrollY||0),
            bottom: this.focus.top + srcPosition.bottom + (this.focus.scrollY||0),
            width: srcPosition.width,
            height: srcPosition.height
        };
    };
    //计算src节点相对desposition的位置信息
    Position.prototype.lower = function (desPosition) {
        return {
            disabled: this.focus.disabled,
            left: this.focus.left - desPosition.left ,
            right: this.focus.right - desPosition.left ,
            top: this.focus.top - desPosition.top ,
            bottom: this.focus.bottom - desPosition.top,
            width: this.focus.width,
            height: this.focus.height
        };
    };
    return Position;
}());

//获取同级的兄弟节点
function getBrotherFocusables(source) {
    if (!source.parent) {
        return false;
    }
    if (!source.parent.children) {
        return false;
    }
    var focusables = [];
    source.parent.children.forEach(function (ev) {
        focusables.push(ev);
    });
    return focusables;
}
//获取子节点
function getChildrenFocusables(source) {
    var focusables = [];
    if (source.children) {
        source.children.forEach(function (ev) {
            focusables.push(ev);
        });
        return focusables;
    }
    else {
        return false;
    }
}
//获取下一个最近的节点
function getClosest(focusables, source, srcPostion, parentPostion, direction) {
    if(!focusables){
        focusables = getBrotherFocusables(source);
    }else {
        focusables = getChildrenFocusables(focusables);
    }
    if (!srcPostion) {
        srcPostion = new Position(source).formart();
    }
    var firstCandidateObj = findFirstCandidate(direction, source, '', srcPostion, focusables);
    if (firstCandidateObj && firstCandidateObj.focusables) {
        var Candidate = firstCandidateObj.focus;
        var index = firstCandidateObj.index;
        var rect1 = firstCandidateObj.position;
        var focusable1 = Candidate;
        srcPostion = firstCandidateObj.srcPostion;
        focusables = firstCandidateObj.focusables;
        if(focusable1.select && focusable1 != source){
            return focusable1;
        }
        if (index < focusables.length - 1) {
            for (var i = index + 1; i < focusables.length; i++) {
                var focusable2 = focusables[i], focus2 = new Position(focusable2), rect2 = focus2.formart();
                if(focusable2.select && focusable2 != source) {
                    return focusable2
                }
                if (!isBetterCandidate(direction, srcPostion, rect1, rect2)) {
                    focusable1 = focusable2;
                    rect1 = rect2;
                    if (i == focusables.length - 1) {
                        //遍历完成，最终rect2获胜
                        if (focusable2.children) {
                            //如果获胜者是集合，则继续寻找最近节点
                            return getClosest(focusable2, source, new Position(srcPostion).lower(rect2), rect2, direction);
                        }
                        return focusable2;
                    }
                }
                else {
                    if (i == focusables.length - 1) {
                        //遍历完成，返回true
                        if (focusable1.children) {
                            //如果获胜者是集合，则继续寻找最近节点
                            return getClosest(focusable1, source, new Position(srcPostion).lower(rect1), rect1, direction);
                        }
                        return focusable1;
                    }
                }
            }
        }
        else {
            //candidate就是最后一个节点，判断是否是集合
            if (focusable1.children) {
                //如果获胜者是集合，则继续寻找最近节点
                return getClosest(focusable1, source, new Position(srcPostion).lower(rect1), rect1, direction);
            }
        }
        return focusable1;
    }
}
module.exports = {
    getClosest:getClosest
}
