/**
 * 计算字符串长度，一个汉字占两个长度单元。
 *
 */
export function getCNlength (str_) {
    let _len = str_.length, _cnlen = 0;   
    for(let i=0; i<_len; i++) {
        if ((str_.charCodeAt(i) & 0xff00) != 0) {
            _cnlen++;
        }
        _cnlen++;
    }
    return _cnlen;
}
export function getImagePath () {
    return 'http://demo-534942307.cn-north-1.elb.amazonaws.com.cn/vistools/epg7_base/ui_static/';
}
