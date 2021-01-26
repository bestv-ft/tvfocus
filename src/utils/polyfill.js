var domQuery = function(query_) {
    var _eles=[], _q = {}, _prefix = query_.substr(0, 1);
    if ('.' == _prefix) {
        _q.type = 'class';
        _q.value = query_.substr(1);
    }
    else if ('#' == _prefix) {
        _q.type = 'id';
        _q.value = query_.substr(1);
    }
    else if ('@' == _prefix) {
        _q.type = 'name';
        _q.value = query_.substr(1);
    }
    else if ('[name=' == query_.substr(0,6)) {
        _q.type = 'name';
        _q.value = query_.substr(6).replace(/['"\]]/g, '');
    }
    else if (/[a-zA-Z]/.test(_prefix)) {
        _q.type = 'tag';
        _q.value = query_;
    }
    switch (_q.type) {
        case 'class':
            _eles = this.getElementsByClassName(_q.value);
            break;
        case 'id':
            _eles = [document.getElementById(_q.value)];
            break;
        case 'name':
            _eles = document.getElementsByName(_q.value);
            break;
        case 'tag':
            _eles = this.getElementsByTagName(_q.value);
            break;
        default:
            break;
    }
    return _eles;
}

if (!Function.prototype.bind) {
    Function.prototype.bind = function (otherThis) {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var baseArgs = Array.prototype.slice.call(arguments, 1),
            baseArgsLength = baseArgs.length,
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                baseArgs.length = baseArgsLength; // reset to default base arguments
                baseArgs.push.apply(baseArgs, arguments);
                return fToBind.apply(
                    fNOP.prototype.isPrototypeOf(this) ? this : otherThis, baseArgs
                );
            };

        if (this.prototype) {
            // Function.prototype doesn't have a prototype property
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();
        return fBound;
    };
}
if (!Object.freeze) {
    Object.freeze = function (obj_) {
        obj_._freezeID = Math.random();
        return obj_;
    }
    Object.isFrozen = function (obj_) {
        return !!obj_.BJF_freezeID;
    }
}
if (!String.prototype.trim) {
    String.prototype.trim = function(char) {
        if (undefined === char) {
            return this.replace(/(^\s*)|(\s*$)/g, '');
        }
        return this.replace(new RegExp('^\\'+char+'+|\\'+char+'+$', 'g'), '');
    };
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        var T, k;
        if(this === null) {
            throw new TypeError("this is null or not defined")
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if(typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }
        if(arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while(k < len){
            var kValue;
            if(k in O){
                kValue = O[k];
                callback.call(T,kValue,k,O);
            }
            k++;
        }
    };
}

if (!Array.prototype.map) {
    Array.prototype.map = function(callback,thisArg) {
        var T, A, k;
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
        }
        if (arguments.length > 1) {
            T = arguments[1];
        }
        if(arguments.length > 1) {
            T = thisArg;
        }
        A = new Array(len);
        k = 0;
        while (k < len) {
            var kValue, mappedValue;
            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }
            k++;
        }
        return A;
    };
}
if ('object' == typeof(document) && !document.querySelector) {
    document.querySelector = function (query_) {
        var _eles = domQuery.call(document, query_);
        if (0 < _eles.length) {
            return _eles[0]
        }
        return null;
    }
    document.querySelectorAll = function (query_) {
        return domQuery.call(document, query_);
    }
}

module.exports = {
    querySelectorAll:function(query_, ele) {
        if (ele.querySelectorAll) {
            return ele.querySelectorAll(query_);
        }
        return domQuery.call(ele, query_);
    },
    querySelector:function(query_, ele) {
        if (ele.querySelector) {
            return ele.querySelector(query_);
        }
        var eles = domQuery.call(ele, query_);
        return eles[0] || null;
    }
}