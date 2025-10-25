import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return [
    // Клиентская сборка - УБИРАЕМ ES модули для клиента
    {
      name: 'client',
      entry: './client/startClient.js',
      mode: isProduction ? 'production' : 'development',
      output: {
        filename: 'client.js',
        path: path.resolve(__dirname, 'dist/client'),
        clean: true
        // УБИРАЕМ module: true и library для клиента
      },
      // УБИРАЕМ experiments для клиента
      resolve: {
        extensions: ['.js']
      },
      externals: {
        'alt-client': 'alt',
        'natives': 'native'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      },
      optimization: {
        minimize: isProduction
      }
    },
    
    // Серверная сборка - оставляем ES модули только для сервера
    {
      name: 'server',
      entry: './server/startServer.js',
      mode: isProduction ? 'production' : 'development',
      target: 'node16',
      output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist/server'),
        clean: true,
        module: true,
        library: {
          type: 'module'
        }
      },
      experiments: {
        outputModule: true
      },
      resolve: {
        extensions: ['.js']
      },
      externals: {
        'alt-server': 'alt',
        'alt-shared': 'alt',
        'fs': 'node:fs',
        'path': 'node:path'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            use: 'babel-loader',
            exclude: /node_modules/
          }
        ]
      },
      optimization: {
        minimize: isProduction
      }
    }
  ];
};