import TVFocus from 'tvfocus';
import TestData from './data';
import MainFocusComp from '../focus/main.focus';
var main_focus = MainFocusComp.createInstance({
    ele:document.querySelector('#main'),
    data:TestData
});


//按键监听
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


TVFocus.setting({
    ui:true
});
TVFocus.init(TVFocus.getNodeById('nav').getChildByIndex(0));
