const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    devtool: 'cheap-module-eval-source-map',
    output: {
        filename:'tvfocus.bundle.js?v=[hash]',
        library: 'TVFocus',
        path: path.resolve(__dirname, './dist')
    },
    devServer:{
        port:80,//控制端口
        hot:true,
        inline:true,
        contentBase:'./test/',
        open:true //是否自动打开默认浏览器
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            uglifyOptions: {
                ie8: true // 解决ie下的关键字default的问题
            }
        })]
    },
    plugins:[
        new HtmlPlugin({   //入口自动注入
            inject:'head',
            filename: './index.html',      //相对于output.path
            template: './test/index.html'
        })
    ]
}
