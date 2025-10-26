/**
 * Конфигурация сборки для alt:V ресурса.
 * Результат:
 * - dist/client/client.js — клиентский ESM-бандл (не включает alt-client/natives).
 * - dist/server/server.js — серверный ESM-бандл (не включает alt-server/alt-shared).
 *
 * Принцип: alt-модули объявлены внешними ESM-модулями (externalsType: 'module'),
 * поэтому Webpack оставляет import 'alt-client' / 'natives' / 'alt-server' / 'alt-shared' в итоговом файле.
 * Эти модули предоставляет рантайм alt:V, и они будут корректно резолвиться при запуске.
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === 'production';

  /** Общие настройки для правил загрузчиков */
  const commonModule = {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            // Важно: не трогаем ESM-импорты, чтобы Webpack корректно управлял ими.
            // preset-env по умолчанию не преобразует модулей, если это не указано.
            presets: [
              ['@babel/preset-env', { targets: { esmodules: true } }]
            ]
          }
        },
        exclude: /node_modules/
      }
    ]
  };

  return [
    // Клиентская сборка (ESM). Не бандлим alt-client и natives — оставляем как внешние ESM-модули.
    {
      name: 'client',
      entry: './client/startClient.js',
      mode: isProduction ? 'production' : 'development',
      target: ['web', 'es2020'], // безопасная цель; не ломает ESM
      output: {
        filename: 'client.js',
        path: path.resolve(__dirname, 'dist/client'),
        clean: true,
        module: true, // ESM-вывод
        library: { type: 'module' }
      },
      experiments: {
        outputModule: true
      },
      resolve: {
        extensions: ['.js']
      },
      // КРИТИЧЕСКОЕ: alt-модули как ESM-externals, а не как глобальные переменные.
      externalsType: 'module',
      externals: {
        'alt-client': 'alt-client',
        'natives': 'natives',
        'alt-shared': 'alt-shared'
      },
      module: commonModule,
      optimization: {
        minimize: isProduction
      },
      devtool: false
    },

    // Серверная сборка (ESM). Не бандлим alt-server/alt-shared — оставляем как внешние ESM-модули.
    {
      name: 'server',
      entry: './server/startServer.js',
      mode: isProduction ? 'production' : 'development',
      target: 'node16',
      output: {
        filename: 'server.js',
        path: path.resolve(__dirname, 'dist/server'),
        clean: true,
        module: true, // ESM-вывод
        library: { type: 'module' }
      },
      experiments: {
        outputModule: true
      },
      resolve: {
        extensions: ['.js']
      },
      externalsType: 'module',
      externals: {
        'alt-server': 'alt-server',
        'alt-shared': 'alt-shared'
      },
      module: commonModule,
      optimization: {
        minimize: isProduction
      },
      devtool: false
    }
  ];
};