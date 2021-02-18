import {getCNlength, getImagePath} from '../utils.js';
let _last_tab;
export default function () {
    TVFocus.addEventListener('row', {
        created (e_) {
            let _multiple = 72, _gap = 24;
            if (!(e_.data.data instanceof Array)) {
                e_.data.data = new Array(6).fill('').reduce((d)=>{d.push({name:''});return d},[]);
            }
            switch(e_.data.style) {
                case 'k':
                case 'a':
                    e_.data.item_height = 94;
                    e_.data.item_width = 2 * _multiple + _gap;
                    break;
                case 'b':
                case 'l':
                    e_.data.item_height = 310;
                    e_.data.item_width = 6 * _multiple + 5 * _gap;
                    break;
                case 'd':
                    e_.data.item_height = 356;
                    e_.data.item_width = 12 * _multiple + 11 * _gap;
                    break;
                case 'j':
                case 'e':
                    e_.data.item_height = 248;
                    e_.data.item_width = 2 * _multiple + _gap;
                    break;
                case 'c':
                case 'f':
                case 'i':
                    e_.data.item_height = 168;
                    e_.data.item_width = 2 * _multiple + _gap;
                    break;
                case 'g':
                    e_.data.item_height = 178;
                    e_.data.item_width = 4 * _multiple + 3 * _gap;
                    break;
                case 'h':
                    e_.data.item_height = 320;
                    e_.data.item_width = 2 * _multiple + _gap;
                    break;
                case 'n':
                case 'o':
                    e_.data.item_height = 154;
                    e_.data.item_width = 3 * _multiple + 2 * _gap;
                    break;
                default:
                    e_.data.item_height = 303;
                    e_.data.item_width = 2 * _multiple + _gap;
                    break;
            }
            let has_name = false, _len = e_.data.data.length;
            if ('e' == e_.data.style) {
                e_.data.data.map((d)=>{if (d.name){has_name=true}});
            }
            if (has_name) {
                e_.data.height = e_.data.item_height + 30;
            }
            else {
                e_.data.height = e_.data.item_height;
            }
            if ((e_.data.item_width*_len + _gap * (_len - 1)) > 1132) {
                this.scrollX = 0;
            }
        }
    });
    TVFocus.addEventListener('entrance', {
        created (e_) {
            if (e_.data.bg_image) {
                e_.data.still = getImagePath() + e_.data.bg_image;
            }
            else {
                e_.data.still = 'demo/images/tv.png';
            }
            if ('e' == e_.data.style) {
                e_.data.title = e_.data.name;
            }
        }
    });
    TVFocus.addEventListener('desktop', {
        mounted () {
            this.onMessage('changeTab', function(msg_) {
                this.setScrollX(-1280*msg_.data);
                this.children[msg_.data].disabled = 0;
                if (undefined !== _last_tab) {
                    this.children[_last_tab].disabled = 1;
                }
                _last_tab = msg_.data;
            });
        },
        border (e) {
            if ('up' == e.data.dir) {
                TVFocus.hideUI();
            }
        }
    });
}
