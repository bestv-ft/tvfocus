/**
 * Ajax 对象封装
 * @author Derong.zeng
 * @param {string} url  需要请求的url
 * @param {object} args 参数与设定
 */
function Ajax(url, args) {
    this.url        = url || '';
    this.params     = args.parameters || '';
    this.mime       = args.mime || 'text/html';
    this.onComplete = args.onComplete || this.defaultOnCompleteFunc;
    this.onLoading  = args.onLoading || this.defaultOnLoadingFunc;
    this.onError    = args.onError || this.defaultOnErrorFunc;
    this.method     = args.method || 'get';
    if (typeof(args.sync) == 'undefined' || args.sync == null) { 
        this.sync = true;
    }
    else {
        this.sync = args.sync ? true : false; //NOTE: yinwm -- 2007/03/30 Convert all other ones like string, number to boolean value.
    }
    this.loadData();
}

Ajax.prototype = {
    READY_STATE_COMPLETE : 4,
    getRequest : function () {
        var req = null;
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest();
        }
        else if (window.ActiveXObject) {
            req = new ActiveXObject('Microsoft.XMLHTTP');
        }
        return req || false;
    },

    //NOTE: yinwm -- convert paramater map to string 
    parseParams : function () {
        if (typeof (this.params) == 'string') {
            return this.params;
        }
        else {
            var s = [];
            for (var k in this.params) {
                s.push(k + '=' + this.params[k]);
            }
            return s.join('&');
        }
    },

    loadData : function () {
        this.req = this.getRequest();
        if (this.req) {
            this.onLoading();
            try {
                if (this.params) {
                    var _params = this.parseParams();
                    if (this.method == 'get') {
                        if (0 < this.url.indexOf('?')) {
                            if (_params != '') {
                                this.url += '&' + _params;
                            }
                        }
                        else {
                            this.url += '?' + _params;
                        }
                    }
                    else {
                        this.params = _params;
                    }
                }
                var loader = this;
                this.req.onreadystatechange = function () {
                    if (loader.req.readyState == loader.READY_STATE_COMPLETE) {
                        if(loader.req.status==200){
                            loader.onComplete.call(loader, loader.req.responseText);
                        }else{
                            loader.onError.call(loader, loader.req.status);
                        }
                    }
                }
                this.req.open(this.method, this.url, this.sync);
                if (this.method == 'post') {
                    this.req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
                }
                if (this.req.overrideMimeType) {
                    this.req.overrideMimeType(this.mime);
                }
                this.req.setRequestHeader('VIS-AJAX','AjaxHttpRequest');//Vis Ajax特殊请求头
                this.req.send(this.method == 'post' ? this.params : null);
            }
            catch (e) {
                // throw e
                this.onError.call(this, e);
            }
        }
        else {
            throw 'Ajax Object Get Failed';
        }
    },

    defaultOnCompleteFunc : function () {
    },

    defaultOnLoadingFunc : function () {
    },

    defaultOnErrorFunc : function (error) {
        throw error;
    }
};

function getData () {
    if (1 > arguments.length) {
        return false;
    }
    var _url  = arguments[0],
        _data = {};
    if (2 == arguments.length) {
        if ('function' == typeof(arguments[1])) {
            _data.onComplete = arguments[1];
        }
        else {
            _data.parameters = arguments[1];
        }
    }
    else if (3 == arguments.length) {
        if ('function' == typeof(arguments[1])) {
            _data.onComplete = arguments[1];
            if('function' == typeof(arguments[2])){
                _data.onError = arguments[2];//将回调方法传递给onError;
            }
        }else{
            _data.parameters = arguments[1];
            if ('function' == typeof(arguments[2])) {
                _data.onComplete = arguments[2];
            }
        }
    }
    else if(4 == arguments.length){//增加一个参数
        _data.parameters = arguments[1];
        if ('function' == typeof(arguments[2])) {
            _data.onComplete = arguments[2];//将这个回调方法传给onComplete
        }
        if('function' == typeof(arguments[3])){
            _data.onError = arguments[3];//将回调方法传递给onError;
        }
    }
    _data.method = 'get';
    new Ajax(_url, _data);
}

export default {
    get () {
        return new Promise((ret_)=>{
            getData('demo/test_data/index.json', (d_)=>{
                ret_(JSON.parse(d_));
            })
        });
    }
}