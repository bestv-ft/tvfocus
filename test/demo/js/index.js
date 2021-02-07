import DataLoader from './data.js';
import StatusbarFocus from './focus/statusbar.js';
import NavbarFocus from './focus/navbar.js';
import DesktopFocus from './focus/desktop.js';

window.onload = function() {
    DataLoader.get().then(function(ret_) {
        let _main_node, _focus_node;
        NavbarFocus();
        StatusbarFocus();
        DesktopFocus();
        _main_node = TVFocus.createNode({
            ele:'#main',
            data:ret_
        });
        _focus_node = TVFocus.getNodeById('navbar');
        TVFocus.init(_focus_node.getChildByIndex(0));
    });
}
