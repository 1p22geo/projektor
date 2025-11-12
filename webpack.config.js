const path = require('path');

module.exports = (env) => {
  const platform = env.platform; // 'web' or 'desktop'
  return {
    mode: 'production',
    entry: `./src/${platform}/index.tsx`,
    output: {
      path: path.resolve(__dirname, `build/${platform}`),
      filename: 'bundle.js',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@core': path.resolve(__dirname, 'src/core/'),
        'react-dom/client': 'react-dom/index.js',
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
  };
};