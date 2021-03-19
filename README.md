# TVFocus指南

# 介绍
TVFocus是一个用于TV端,开发web应用的js框架。和其它框架相比,TVFocus专注处理TV端的光标问题,体积小效率高,可与其它框架搭配使用。
TVFocus采用事件驱动方式实现组件通信、消息机制来实现状态管理。数据单向传递,无响应式更新,在其它方面追求简单易用。
TVFocus不依赖其它框架或包,不依赖ES5/6的新特性。以安卓4.0为适配起点,能够兼容市面上绝大部分(webview)机顶盒。
#### 安装
TVFocus支持js文件引入方式,和npm安装方式。
js引入:
> 请在publish目录下载对应的版本。

Using npm:
> $ npm i --save tvfocus

# 入门指引
TVFocus有点像是一个JS模板引擎。与其它模板引擎相比,TVFocus支持一种名为"focus"的特殊标签,渲染时focus标签将会被渲染成普通的DIV元素,同时在内部生成一个名为FocusNode的对象(组件实例)。如果开发者有其它组件框架的使用经验,那么上手TVFocus还是比较容易的。
### 何谓focus
focus就是焦点,前端工程师们肯定都不陌生。PC端和移动端,用户交互主要使点击和触摸,不用太关心焦点在哪,以及焦点的状态。TV端的大屏操作主要通过遥控器。用户需要通过遥控器移动光标框,选中想要看的节目。因此我们需要时刻关心,光标是什么状态、在哪、怎么移动。这就是TVFocus要解决的核心问题。
#### focus节点
在页面中,每个能够落焦的区域,我们称之为focus节点。如下图所示,一个典型的横板TV界面中,栏目、影片、入口,都可落焦,那么他们都是光标节点。
![page_demo.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/1088551/1602211398584-0e01e6e7-e160-4781-9ef5-4354c9a75f66.jpeg#align=left&display=inline&height=347&margin=%5Bobject%20Object%5D&name=page_demo.jpg&originHeight=347&originWidth=496&size=57203&status=done&style=none&width=496)
一般来说,每个光标节点都能找到与之对应的DOM节点,从而与之形成一对一的绑定关系。与此同时可依赖DOM的样式布局,来计算出节点光标框的位置和大小。
#### FocusTree
我们回顾一下上图很容易发现,栏目、影片、入口,他们都是一排一排有规则的排列着的。为了节省开销,TVFocus将光标节点进一步打包成群组。群组节点的children指向它包含的子节点,每个子节点的parent指向包含他们的群组节点。如此一来,群组节点就成了一种有children的特殊focus节点,此类节点亦有与之对应的更高层级DOM节点。
相邻的群组,可以进一步打包,形成一个大的群组。经过逐层打包,最终可将所有节点打包进一个根节点下。这样就形成了一棵树,叫FocusTree。这个和DOMTree的概念是一样的。如下图所示:
![page_group_demo.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/1088551/1602220752668-3b0a52ca-af40-4088-adae-ede9b906808f.jpeg#align=left&display=inline&height=408&margin=%5Bobject%20Object%5D&name=page_group_demo.jpg&originHeight=408&originWidth=546&size=67631&status=done&style=none&width=546)
#### FocusNode对象
FocusNode对象是focus节点的JS实现。在解析模板的过程中,TVFocus内部通过new FocusNode()来生成FocusNode实例,并绑定父子关系,挂载DOM。
FocusNode.getEle()方法能够返回节点对应的真实DOM,也就是focus标签解析后生成的DIV。除此之外FocusNode还有以下用途:

   - 管理光标节点的布局,每个FocusNode都有left\top\width\height这四个属性,这四个属性关系到光标的移动寻路,以及光标框的UI呈现。
   - FocusNode可触发一系列事件,开发者可在业务代码中监听这些事件,实现自己的逻辑。
   - FocusNode可收发消息,以此来实现简单的数据共享和状态管理。

理论上除根节点外,FocusNode对象由框架自动生成,一般不需要开发者干预,对于FocusNode的管理则由TVFocus对象自身来实现。
### 模板语法
TVFocus的模板语法与vue、wx小程序等模板语法类似,采用了类mustache语法。
例如:
```html
<div id="main">
  <h1>{{message}}</h1>
</div>
```
双大括号内,可以是变量、表达式、JS内置的原生对象或方法。
模板内,支持if条件判断,和each循环,例如:
```html
{{if a}}
  <h1>a</h1>
{{else if b}}
  <h1>b</h1>
{{else}}
  <h1>c</h1>
{{/if}}

{{each obj val key}}
  <div>{{key}}:{{val}}</div>
{{/each}}
```
### focus标签
在TVFocus模板中,可使用focus标签来定义光标节点,通过添加focus标签属性来设置光标属性。focus标签可嵌套,以此来实现父子节点关系。
focus标签在渲染时将会被解析成div标签,与此同时在js中将会生成一个FocusNode对象。
```html
<div id="main">
  <focus data="{{menu}}" name="menu">
    {{each $data}}
    <focus name="nav" data={{$value}}>{{$data}}</focus>
    {{/each}}
  </focus>
</div>
```
#### 标签属性
如上所示,和HTML标签一样,focus标签也可添加标签属性。比较重要的标签属性有:

   - data属性,该属性是接收数据的属性。所有光标节点都应有自己的数据。
   - name属性,focus标签的名字,相当于是组件名。(除了root节点)也是必须的。
   - id属性,如果你想让节点拥有独立的ID,那么就给它设置一个ID属性。如果不设置,那么框架将给它分配一个默认ID。

如果标签属性是FocusNode所需的指定属性,将会同步到其生成的FocusNode对象上。如非指定属性,将保留在focus标签渲染后对应的DIV标签上,例如“class”,“style”等。
#### 属性赋值
focus标签的属性值,可使用模板变量或字符串、数字,不可变量和数字/字符串混合使用。
style属性和layout属性例外,它们可由变量和字符串混合使用,例如:
```html
<focus name="btn" data={{btn}} id="{{btn_id}}" style="
    float: left; 
    width: {{width}}px;
    margin: 10px;
    height: {{height}}px;">
 {{title}}</focus>
```


#### 模板变量的命名空间
如果把focus标签当成一个组件,那么就必然有其对应的数据。如介绍data属性时所说:“所有光标节点都应有自己的数据”。
这些数据就是模板渲染时,模板变量的赋值来源。由于focus标签是可嵌套的,所以就会有命名空间的区分。
TVFocus的模板命名空间规则为:所有的模板变量,都是其所在的focus标签的data属性。看代码一目了然:
```html
<div id="main">
  <h1>{{name}}</h1>
  <focus data={{son}} name="a">
    <h2>{{name}}</h2>
    <focus data={{grandson}} name="b">{{$data}}</focus>
  </focus>
</div>
<script>
var mainFocus = TVFocus.createNode({
  ele:'#main',
  data:{
    name:'I`m Kim Il Sung',
    son:{
      name:'Kim Jong Il',
      grandson:'Kim Jong Un'
    }
  }
});
</script>
```


**需注意的是**,focus标签属性值中的变量,其命名空间是其父标签的data。只有focus标签内才是它的data空间范围。
除此之前,还有5个内置变量,分别是:

   - $data,直接指向focus的data属性本身,当data属值是数字、字符串等直接量时,用$data非常有用,例如上面示例中的“grandson”。
   - $global,global变量意味着你可以在整个模板的任意地方使用，而不用管作用域层级。申明global变量需要在顶层节点的created事件里，将需要的变量属性赋值到$data.$global上来。
   - $self,在标签属性上,作用域还是父标签的data范畴,如果要提前使用本标签内的数据,则需要加上$self前缀。
   - $value,在each语句中,如果没有指定第二个参数,则默认用$value表示当前循环的值。
   - $index,在each语句中,如果没有指定第三个参数,则默认用$index表示当前循环的下标(对象的key),例如:
```javascript
<div id="main">
  {{each list}}
    <div title="{{$global.a}}">循环到{{$index}},它的值是{{$value}}</div>
  {{/each}}
  <focus class="foo">
    <focus id="{{$self.id}}" class="bar">{{name}}--{{$global.b}}</focus>
  </focus>
</div>
<script>
TVFocus.addEventListener('main', 'created', function(){
  this.$data.$global = {a:1,b:2};
});
var mainFocus = TVFocus.createNode({
  ele:'#main',
  name:'main',
  data:{
    list:['a','b','c'],
    foo:{
      bar:{
        id:'hello',
        name:'TVFocus'
      }
    }
  }
});
 </script>
```

### 启动
#### 渲染模板
严格意义上来说,TVFocus没有提供模板渲染方法,仅提供了创建节点的方法:TVFocus.createNode。
此方法接收数据和模板,返回一个FocusNode实例,并且将渲染后的HTML片段,更新至模板所处的DOM节点下。例如:
```html
<div id="main">
  <div class="navbar">
    {{each nav}}
    <focus class="nav" data={{$value}}>{{$data}}</focus>
    {{/each}}
  </div>
</div>
<script>
  var root_node = TVFocus.createNode({
    ele:'#main',
    data:{
      nav:['栏目1','栏目2','栏目3','栏目4','栏目5','栏目6']
    }
  });
</script>
```
如上所示,我们创建了一个节点root_node。这是此光标系的根节点,该节点包含6个“栏目”子节点。
#### 初始落焦
初始落焦是指,页面上的第一个落焦节点。有了落焦节点才可使用方向键控制焦点移动。通过此方法可设置初始落焦节点:TVFocus.init()。例如:
```javascript
//接上
TVFocus.init(root_node.getChildByIndex(0));
```
以上代码显而易见,将root_node的第一个节点“栏目1”设为了落焦节点。此时(如果布局设置正确的话),光标框将显示在“栏目1”上。
#### 移动焦点
TVFocus提供了moveTo方法用于光标移动。开发者可自行监听遥控器方向键,然后调用TVFocus.moveTo方法实现光标移动,moveTo方法接受一个direction参数,用于告诉框架向哪个方向移动,该参数取值为"left/right/up/down"这四个字符串,例如:
```javascript
document.onkeydown = function(e) {
  switch(e.keyCode) {
  case 38:
    TVFocus.moveTo('up');
    break;
  case 39:
    TVFocus.moveTo('right');
    break;
  case 40:
    TVFocus.moveTo('down');
    break;
  case 37:
    TVFocus.moveTo('left');
    break;
  }
}
```
TVFocus的节点寻路采用的是就近落焦。框架会根据光标节点的布局信息,选中符合移动方向的、距离当前节点最近的一个新节点。
如果你需要人工切换到指定节点,用TVFocus.change(node)方法即可。
### 事件监听
#### 事件定义
在TVFocus中有两种类型的事件,分别为:

   - 生命周期事件

生命周期事件是指,FocusNode从创建到销毁的生命周期中,各个阶段的事件。具体包括:
created(创建)、mounted(挂载DOM)、destroy(销毁)。

   - 光标事件

光标事件是指,在光标焦点移动的过程中,触发的一系列事件,具体包括:
on(落焦)/blur(失焦)、selected(选中)/unselected(未选中)、border(到达边界)
#### 事件监听
通过TVFocus.addEventListener可实现对节点的事件监听。TVFocus.addEventListener方法有三个入参,分别为:监听对象(节点的name)、事件名、回调函数。例如:
```javascript
TVFocus.addEventListener('nav', 'on', function(event) {
  console.log('我落焦了');
});
//也可把事件名和回调,合并成key=>value对象的方式一次监听多个事件。
TVFocus.addEventListener('nav', {
  on: function(event) {
    console.log('我落焦了');
  },
  blur: function(event) {
    console.log('拜拜了您');
  }
});
```
如上所示,每个回调函数,可接收一个event参数。event参数包含一些事件上下文信息以供回调函数使用。比如:

   - 在created、mounted事件中,可使用event.data获取渲染数据。
   - 在on、blur、selected、unselected、border事件中,可使用event.dir获取光标移动的方向标识("left/right/up/down"这四个字符串)。
   - 通过event.preventDefault()可阻止默认事件监听,通过event.stopPropagation()可停止事件冒泡。
### 消息通信
TVFocus的消息机制,可实现任意关系的节点之间相互通讯。FocusNode对象的postMessage方法发送消息,onMessage方法接收消息。
postMessage方法有三个入参,分别是:消息名、消息数据(任意类型数据)、接收者ID(可选)。如果没有指定接收者,则为群发消息,凡是监听此消息名的节点,都可接收到。
onMessage方法有两个入参,分别是:消息名、消息体。消息体是一个包含source属性(消息的发送者)和data属性(消息数据)的对象。例如:
```javascript
TVFocus.addEventListener('nodeA', {
  on : function(e) {
    this.postMessage('go', this.index);//群发消息
    this.postMessage('hi', '嘿嘿', 'nodeB');//单点消息
  }
});
TVFocus.addEventListener('nodeB', {
  mounted : function(e) {
    this.onMessage('go', function(msg_) {
      console.log(msg_.source);
      console.log(msg_.data);
    });
  }
});

```
# 进阶用法
### 单文件组件
开发者可以把模板和事件监听,放在一个单独的文件中,形成单文件组件。
TVFocus约定单文件组件的名称后缀必须为.focus,且需要通过tvfocus-loader来加载打包。关于tvfocus-loader的使用,可以查看loader目录的文档。

在单文件组件中,模板必须由template标签包裹,js逻辑必须由script标签包裹。光标节点的事件监听,需要在script中export default导出一个对象,对象由各个事件的监听函数组成。

如果在组件的模板中,使用子组件,则需要在script标签内导入子组件文件,然后确保模板中的focus标签名,与子组件的接收变量名一致就行了。例如main.focus文件:

```html
<template>
  <focus class="header" data="{{menu}}"></focus>
  <focus class="desktop" data="menu"  scroll="x"></focus>
</template>
<script>
import header from './header/header.focus';
import desktop from './desktop/desktop.focus';
export default {
  on:function (e) {console.log(e)}
}
</script>

```



### 布局管理
TVFocus的就近寻路机制,需要提供每个节点的(位置和大小等)布局信息。所以focus节点拥有width、height、left、top这几个属性,以供寻路时的布局计算。
width与height表示光标节点的区域大小,这个好理解。left和top表示该节点区域左顶点,相对于父节点的位置。这四个属性在寻路中必不可少。其值可由框架自动获取,或在focus标签中指定layout属性来设置。

   - 自动获取:无需在focus标签中设置layout属性,或设置layout="auto"。自动获取需要利用浏览器的getBoundingClientRect接口,如果有兼容性风险,请使用人工设置方式。
   - 人工设置:可在focus标签中设置layout属性,来告诉框架该节点的布局信息。



#### layout属性
前文说到,需要人工设置时,可在focus标签中设置layout属性。这里需要说明一下layout属性值的格式。
layout属性参照了DOM的style属性值的格式,就如同设置style一样:
```html
<focus name="m_btn"
  layout="
    left:{{10+$index%3*320}};
    top:{{10+Math.floor($index/3)*70}}"
  style="
    float: left; 
    width: 300px;
    margin: 10px;
    background-color: #4d824d;
    height: 50px;"
each={{$data}}>{{title}}</focus>
```
layout属性与style属性的区别在于:layout属性的单位默认是px,不支持其它单位。layout属性的left与top,是相对于父节点左顶点的距离,与style的定位无关。
layout属性里的布局信息,可以只指定某一个或某几个,未指定值的布局信息会使用默认值:

   - width/height的默认值,会尝试从dom节点的style中获取。
   - left/top的默认值为0。
   - 如果全都希望使用默认值,可直接设定layout="defaullt"或layout="def"。
   - 如果最终没有获取到width/height信息,框架会抛出异常。



### 简写
TVFocus提供了一些属性的简写方式,例如:
```html
<focus class="item"></focus>
<!-- 等同于 -->
<focus class="item"  name="item"></focus>
<!-- 等同于 -->
<focus class="item"  name="a" data={{item}}></focus>
```
each循环内嵌focus标签,可简写成focus标签的each属性。
```html
{{each list}}
<focus name="item" data={{$value}}></focus>
{{/each}}
<!-- 等同于 -->
<focus each={{list}} name="item"></focus>
```
### 其它技巧
#### scroll属性
在TV-APP的产品设计中,滑动是最常见的一种操作效果。focus标签支持配置scroll属性,来指定该光标节点是否支持滑动。
scroll属性的取值为x或y,表示其滑动方向为水平或垂直,只能指定一个方向。
scroll属性的取值后面可跟一个默认值,表示其初始的滑动距离,比如:scroll="x:80"表示该节点初始的水平滑动距离为80px。
scroll属性解析后,将会在节点关联的DOM下额外生成一个绝对定位的div,当操作节点滑动时,改动的将是此div的位置偏移。
模板解析后,可调用节点的setScrollX/setScrollY方法控制节点滑动,例如:
```html
<div id="main">
  <focus class="list" scroll="x:-30">
    <focus each="{{$data}}" class="item">{{$data}}</focus>
  </focus>
</div>
<script>
  var i=0;
  var node = TVFocus.createNode({
    ele:'#main',
    data:{
      list:[1,2,3,4,5,6]
    }
  });
  setInterval(()=>{
    node.getChildByIndex(0).setScrollX(-i*30);i++
  },1000);
</script>
```


#### cache属性
在前面介绍光标事件的时候,我们讲到focus有selected和unselected两种状态。有一种场景是,当我们选中一个节点后然后离开它,光标往回走时我们期望任然停留在它上面,这种需求有可能会跟就近寻路相悖。所以当你期望实现这种需求时,可以在这种节点的focus标签上,增加一个cache属性。
cache属性无需指定其值,例如:
```html
<focus each="{{$data}}" cache class="item">{{$data}}</focus>
```
