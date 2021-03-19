const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './test/component/index.js',
    devtool: 'cheap-module-eval-source-map',
    output: {
        filename:'test.bundle.js?v=[hash]',
        path: path.resolve(__dirname, './dist')
    },
    devServer:{
        port:80,//控制端口
        hot:true,
        inline:true,
        contentBase:'./test/',
        open:true //是否自动打开默认浏览器
    },
    resolve:{
        alias: {
            'tvfocus': path.resolve(__dirname,'./src')
        }
    },
    module: {
        rules: [
            {
                test:/\.focus$/,
                exclude:/(node_modules)/,
                use:path.resolve(__dirname, './loader/dev.js')
            }
        ]
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
            inject:true,
            filename: './index.html',      //相对于output.path
            template: './test/index.html'
        })
    ]
}
