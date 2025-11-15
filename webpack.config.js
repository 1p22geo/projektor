const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
require('dotenv').config({ path: '.env.local' });

module.exports = (env) => {
  const platform = env.platform; // 'web' or 'desktop'
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  return {
    mode: isDevelopment ? 'development' : 'production',
    entry: `./src/${platform}/index.tsx`,
    output: {
      path: path.resolve(__dirname, `build/${platform}`),
      filename: 'bundle.js',
      publicPath: '/',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@core': path.resolve(__dirname, 'src/core/'),
        '@platform': path.resolve(__dirname, `src/${platform}/`),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: true,
            },
          },
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './static/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3000/api'),
        'process.env.SOCKET_URL': JSON.stringify(process.env.SOCKET_URL || 'http://localhost:3000'),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ],
    devServer: {
      historyApiFallback: true,
      port: 8080,
      hot: true,
    },
  };
};