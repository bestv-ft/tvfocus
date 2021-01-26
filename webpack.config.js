const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
    entry: './src/index.js',
    output: {
        filename:'tvfocus.bundle.js?v=[hash]',
        library: 'TVFocus',
        path: path.resolve(__dirname, './dist')
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            uglifyOptions: {
                ie8: true // 解决ie下的关键字default的问题
            }
        })]
    }
}
