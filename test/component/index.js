import TVFocus from '../../src/index';
import MainFocusComp from './main.focus';

var main_focus = MainFocusComp.createInstance({
    ele:document.querySelector('#main'),
    data:{
        title:'消息监听测试',
        menu:[{
            name:'看电视',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'推荐',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'趣成长',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'电影',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'电视剧',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'少儿',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'教育',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'纪实',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'咨询',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'少儿',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'教育',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'纪实',
            data:['aaaa','bbbb','cccc','dddd']
        },{
            name:'咨询',
            data:['aaaa','bbbb','cccc','dddd']
        }]
    }
});

TVFocus.init(main_focus);
