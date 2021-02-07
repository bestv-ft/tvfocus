import {getCNlength, getImagePath} from '../utils.js';
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
            e_.data.height = e_.data.item_height;
        }
    });
    TVFocus.addEventListener('entrance', {
        created (e_) {
            console.log(e_.data.bg_image);
            if (e_.data.bg_image) {
                e_.data.still = getImagePath() + e_.data.bg_image;
            }
            else {
                e_.data.still = 'demo/images/tv.png';
            }
        }
    });
}
