import {getCNlength, getImagePath} from '../utils.js';
let navfocusBox;
export default function () {
    TVFocus.addEventListener('navbar', {
        mounted () {
            navfocusBox = document.querySelector('.navfocus', this.$ele);
        }
    });
    TVFocus.addEventListener('nav', {
        created (e_) {
            if (e_.data.is_image_tab) {
                e_.data.show_image = true;
                e_.data.default_icon = getImagePath()+e_.data.default_icon;
                e_.data.focus_icon = getImagePath()+e_.data.focus_icon;
                e_.data.selected_icon = getImagePath()+e_.data.selected_icon;
                e_.data.width = e_.data.icon_width;
            }
            else {
                e_.data.width = getCNlength(e_.data.name)*18;
            }
            this.markFocusData('width');
        },
        on () {
            this.$ele.style.color = '#000000';
            this.$ele.style.fontWeight = 'bold';
            navfocusBox.style.width = this.data.width + 'px';
            navfocusBox.style.webkitTransform = `translate3d(${this.left-72}px, 0px, 0px)`;
        },
        blur () {
            this.$ele.style.color = '#888da1';
            this.$ele.style.fontWeight = '';
        }
    });
}
