import {getCNlength, getImagePath} from '../utils.js';
export default function () {
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
        }
    });
}
