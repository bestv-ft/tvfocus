function Handler(msg_, fragment_, type_) {
    var _msg = '';
    if ('object' == typeof(msg_)) {
        if ('TVFocus ' === msg_.message.substr(0,8)) { //已经捕获过了
            return msg_;
        }
        _msg = msg_.message;
    }
    if (!type_) {
        type_ = Handler.ERROR_RUN;
    }
    if (undefined === type_) {
        type_ = Handler.ERROR_CREATE;
    }
    if (fragment_) {
        _msg = _msg + ' in this template:\n ------------------>\n';
        _msg = _msg + fragment_;
        _msg = _msg + '\n<------------------';
    }
    switch(type_) {
        case Handler.ERROR_CREATE:
            _msg = 'TVFocus CreateNode Error:\n' + _msg;
            break;
        case Handler.ERROR_COMPILE:
            _msg = 'TVFocus Compile Error:\n' + _msg;
            break;
        case Handler.ERROR_RUN:
            _msg = 'TVFocus Render Error:\n' + _msg;
            break;
        default:
            _msg = 'TVFocus System Error:\n' + _msg;
            break;
    }
    return new Error(_msg);
}

Handler.ERROR_CREATE = 1;
Handler.ERROR_COMPILE = 2;
Handler.ERROR_RUN = 3;
Handler.ERROR_TYPE = 4;
module.exports = Handler;