const compiler = require('../src/compiler/index');
const FocusNode = require('../src/node/node');
let tpl = `
<div id="main">
        <h1>{{title}} + {{title?title:'b'}}</h1>
        <h1>{{'sdb'.concat('d', b, new Date(),d.de,.,"we")}}</h1>
        <h1>{{20-sfh}}</h1>
        <focus name="left" data="{{left}}" class="left">
            <div class="content">{{title}}</div>
        </focus>
        <focus name="right" id="right" class="{{deew}}" width="300" height="300" left="9" top="2" data="{{right+Math.rundrom()}}" style="display:block" disabled gap="67" scorll="x">
            {{each list value ind}}
                {{if 0==ind}}
                {{if 0==i}}
                <div class="title" id="{{right+Math.rundrom()}}">{{title}}</div>
                {{/if}}
                {{/if}}
                <h2>{{value}}+{{value.length}}</h2>
                <h2>{{value}}+{{global()}}</h2>
                <focus name="row" data={{value}}>
                    <div>{{.}}</div>
                </focus>
            {{/each}}
        </focus>
    </div>
`;

var main_focus = new FocusNode({
    render:compiler(tpl),
    data:{title:'aaaa',d:{de:123}}
});
//main_focus.render();
console.log(main_focus);
