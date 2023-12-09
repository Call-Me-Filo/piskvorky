const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: "./src/index.ts",
    mode: "development",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js"]
    },
    module: {
        rules: [{ test: /\.ts$/, loader: "ts-loader" }]
    }, plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {from: path.resolve(__dirname,"index.html")},
                {from: path.resolve(__dirname,"style.css")},
            ]
        })
    ]
}
