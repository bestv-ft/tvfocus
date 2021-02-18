import DataLoader from './data.js';
import StatusbarFocus from './focus/statusbar.js';
import NavbarFocus from './focus/navbar.js';
import DesktopFocus from './focus/desktop.js';

function keyListen() {
    document.onkeydown = function(e) {
        if (38 == e.keyCode) {
            TVFocus.moveTo('up');
            e.preventDefault();
        }
        else if (40 == e.keyCode) {
            TVFocus.moveTo('down');
            e.preventDefault();
        }
        else if (37 == e.keyCode) {
            TVFocus.moveTo('left');
            e.preventDefault();
        }
        else if (39 == e.keyCode) {
            TVFocus.moveTo('right');
            e.preventDefault();
        }
    }
}

window.onload = function() {
    TVFocus.setting({
        ui:true
    });
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
        keyListen();
    });
}
