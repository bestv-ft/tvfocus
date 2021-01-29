function refreshClock(_box) {
        let _t = new Date(), _h = _t.getHours(), _m = _t.getMinutes();
        if (10 > _h) {
            _h = '0' + _h;
        }
        if (10 > _m) {
            _m = '0' + _m;
        }
        _box.innerText =  _h + ':' + _m;
        setTimeout(refreshClock, 60000);
}

export default function () {
    TVFocus.addEventListener('statusbar', {
        mounted () {
            let _c = this.$ele.querySelector('.clock');
            refreshClock(_c);
        }
    });
}
