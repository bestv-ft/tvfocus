var DirectionFilter  = require('./direction');
var ProjectionFilter = require('./projection');
var Converter = require('./converter');

/**
 *
 * @param {FocusNode} source
 * @param {FocusNode} king
 * @param {FocusNode} challenger
 * 比较与source的中心点距离，近的获胜
 */
function distanceCompete (source, king, challenger) {
    var _s = source.getRect(), _k = king.getRect(), _c = challenger.getRect(),
        _p1, _p2, _p3, _d1, _d2;
    _p1 = {x:_s.left + parseInt(_s.width/2), y:_s.top - parseInt(_s.height/2)};
    _p2 = {x:_k.left + parseInt(_k.width/2), y:_k.top - parseInt(_k.height/2)};
    _p3 = {x:_c.left + parseInt(_c.width/2), y:_c.top - parseInt(_c.height/2)};
    _d1 = {x:_p2.x-_p1.x, y:_p2.y-_p1.y};
    _d2 = {x:_p3.x-_p1.x, y:_p3.y-_p1.y};
    if (_d1.x*_d1.x+_d1.y*_d1.y <= _d2.x*_d2.x+_d2.y*_d2.y) {
        return king;
    }
    else {
        return challenger;
    }
}

/**
 *
 * @param {FocusNode} source
 * @param {FocusNode} king
 * @param {FocusNode} challenger
 * @param {String} dir
 * 比较位置，指定方向上，靠近source的获胜。
 */
function positionCompete (source, king, challenger, dir) {
    var _king = king.getRect(), _challenger = challenger.getRect();
    if ('up' == dir) {
        if (_king.top + _king.height <= _challenger.top) { //_challenger在下面
            return challenger;
        }
        if (_challenger.top + _challenger.height <= _king.top) { //_king在下面
            return king;
        }
        if (king.children || challenger.children) { //交错，且一方是集合
            if (king.children) {
                //先进入king集合，找到最优子节点，然后再将该子节点映射至外层。
                king = Converter.mapOut(getNext(Converter.mapIn(source, king), dir));
            }
            if (challenger.children) {
                challenger = Converter.mapOut(getNext(Converter.mapIn(source, challenger), dir));
            }
            return positionCompete(source, king, challenger, dir);  //TODO 找到子节点代表后继续PK
        }
        if (_king.top + _king.height >= _challenger.top + _challenger.height) {
            return king;
        }
        else {
            return challenger;
        }
    }
    else if ('down' == dir) {
        if (_challenger.top + _challenger.height <= king.top) { //_challenger在上面
            return challenger;
        }
        if (_king.top + _king.height <= _challenger.top) { //_king在上面
            return king;
        }
        if (king.children || challenger.children) { //交错，且一方是集合
            if (king.children) {
                //先进入king集合，找到最优子节点，然后再将该子节点映射至外层。
                king = Converter.mapOut(getNext(Converter.mapIn(source, king), dir));
            }
            if (challenger.children) {
                challenger = Converter.mapOut(getNext(Converter.mapIn(source, challenger), dir));
            }
            return positionCompete(source, king, challenger, dir);  //TODO 找到子节点代表后继续PK
        }
        if (_king.top <= _challenger.top) {
            return king;
        }
        else {
            return challenger;
        }
    }
    else if ('left' == dir) {
        if (king.left + king.width <= _challenger.left) { //_challenger在右面
            return challenger;
        }
        if (_challenger.left + _challenger.width <= king.left) { //_king在右面
            return king;
        }
        if (king.children || challenger.children) { //交错，且一方是集合
            if (king.children) {
                //先进入king集合，找到最优子节点，然后再将该子节点映射至外层。
                king = Converter.mapOut(getNext(Converter.mapIn(source, king), dir));
            }
            if (challenger.children) {
                challenger = Converter.mapOut(getNext(Converter.mapIn(source, challenger), dir));
            }
            return positionCompete(source, king, challenger, dir);  //TODO 找到子节点代表后继续PK
        }
        if (king.left + king.width >= _challenger.left + _challenger.width) {
            return king;
        }
        else {
            return challenger;
        }
    }
    else {
        if (_challenger.left + _challenger.width <= king.left) { //_challenger在左面
            return challenger;
        }
        if (king.left + king.width <= _challenger.left) { //_king在左面
            return king;
        }
        if (king.children || challenger.children) { //交错，且一方是集合
            if (king.children) {
                //先进入king集合，找到最优子节点，然后再将该子节点映射至外层。
                king = Converter.mapOut(getNext(Converter.mapIn(source, king), dir));
            }
            if (challenger.children) {
                challenger = Converter.mapOut(getNext(Converter.mapIn(source, challenger), dir));
            }
            return positionCompete(source, king, challenger, dir);  //TODO 找到子节点代表后继续PK
        }
        if (king.left <= _challenger.left) {
            return king;
        }
        else {
            return challenger;
        }
    }
}

function getNext (node_, dir_) {
    if (!node_.parent) {
        return null;
    }
    if ('up' != dir_ && 'down' != dir_ && 'left' != dir_ && 'right' != dir_) {
        return null;
    }
    var _candidates = node_.parent.children,
        _same_camp = [], _len, _king = null, _target;
    _len = _candidates.length;
    for (var i = 0; i < _len; i++) {
        _target = _candidates[i];
        //第一轮，状态过滤加方向过滤，不用考虑集合。
        if (node_.fingerprint === _target.fingerprint || _target.disabled) {
            continue;
        }
        else {
            var _apos = DirectionFilter[dir_](node_, _target);
            if (_apos) {
                if (1 === _target.select) {
                    //符合方向的选中状态节点，直接命中
                    _king = _target;
                    break;
                }
                //第二轮，投影过滤，不需要考虑集合。
                if (ProjectionFilter[dir_](node_.getRect(), _target.getRect())) {
                    if (!_king) {
                        _king = _target;
                    }
                    else {
                        //第三轮，位置竞争，打平时需要考虑集合
                        _king = positionCompete(node_, _king, _target, dir_);
                    }
                }
                else {
                    if (!_target.children || 1 === _apos) {
                        _same_camp.push(_target);
                    }
                }
            }
        }
    }
    if (!_king && 0 < _same_camp.length) {
        _len = _same_camp.length;
        //第四轮，距离竞争，必须考虑集合。
        _king = _same_camp[0];
        if (_king.children) {
            _king = Converter.mapOut(getNext(Converter.mapIn(node_, _king), dir_));
        }
        for (var j = 1; j < _len; j++) {
            _target = _same_camp[j];
            if (_target.children) {
                _target = Converter.mapOut(getNext(Converter.mapIn(node_, _target), dir_));
            }
            _king = distanceCompete(node_, _king, _target);
        }
    }
    //结果清算
    if (_king) {
        if (_king.children) {
            _king = getNext(Converter.mapIn(node_, _king), dir_);
        }
        while(_king.realnode) {
            _king = _king.realnode;
        }
        return _king;
    }
    else {
        if ('in' != node_.maping && node_.parent.parent) {
            return getNext(Converter.mapOut(node_), dir_)
        }
        else {
            return null;
        }
    }
}

module.exports = {
    getNext:getNext
}
