import DataLoader from './data.js';
import StatusbarFocus from './focus/statusbar.js';
import NavbarFocus from './focus/navbar.js';

window.onload = function() {
    DataLoader.get().then(function(ret_) {
        NavbarFocus();
        StatusbarFocus();
        TVFocus.createNode({
            ele:'#main',
            data:ret_
        });
    });
}