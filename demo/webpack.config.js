const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './js/index.js',
    devtool: 'cheap-module-eval-source-map',
    output: {
        filename:'test.bundle.js?v=[hash]',
        path: path.resolve(__dirname, './dist')
    },
    devServer:{
        port:80,//控制端口
        hot:true,
        inline:true,
        contentBase:'./',
        open:true //是否自动打开默认浏览器
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                //开启css modules
                use: [{loader: 'style-loader'},{loader: 'css-loader',options:{modules:true}}]
            },
            {
                test:/\.focus$/,
                exclude:/(node_modules)/,//排除掉node_module目录
                loader:'tvfocus-loader'
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
            template: './index.html'
        })
    ]
}
