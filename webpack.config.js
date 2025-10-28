//для работы с путями файлов
import path from 'path';



// fileURLToPath преобразует file:// url в обычный путь, функция для работы с ES модулями
import { fileURLToPath } from 'url';

// __filename запоминает текущий путь к файлу webpack.config.js
const __filename = fileURLToPath(import.meta.url);  // import.meta.url содержит url текущего модуля file:///D:/path/to/webpack.config.js) и fileURLToPath преобразует это в обычный путь: D:/path/to/webpack.config.js (без этого был некоректный путь)
const __dirname = path.dirname(__filename);   // path.dirname() возвращает родительскую директорию файла


export default (env, argv) => { // функция конфигурации которая принимает параметры окружения
// env - объект с переменными окружения
// argv - аргументы командной строки (включая --mode)
  // argv.mode может быть:
  // - 'development' (по умолчанию)
  // - 'production' 
  // - 'none'
  const isProduction = argv.mode === 'production';
/*
production:
  Удаляются комментарии
  Сокращаются имена переменные
  Удаляются лишние пробелы, переносы
  Оптимизируются выражения
*/
/*
development:
  Без минификации
  Включает имена модулей
  Оптимизация скорости
*/

  // общие настройки для правил загрузчиков (LOADERS)
const commonModule = {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', { targets: { esmodules: true } }]]
        }
      }
    },
    {
      test: /\.html$/i,
      use: 'raw-loader', 
    }
  ]
};
  // возвращает массив конфигураций для выполнения доп сборок
  return [
    // Клиентская сборка (esm). Не бандлит alt-client и natives — оставляем как внешние esm-модули.
    {
      name: 'client', // имя конфигурации для отладки

      // Добавляем Consts.js как дополнительную точку входа
      entry: [
        './shared/Consts.js',    // СНАЧАЛА загружаем Consts.js
        './client/startClient.js' // ПОТОМ загружаем startClient.js
      ],
      mode: isProduction ? 'production' : 'development',  // режим сборки влияет на оптимизацию
      target: ['web', 'es2020'], // Целевая среда сборки, не ломает esm
      // Настройки выходных файлов
      output: {
        filename: 'client.js',  // Имя итогового файла
        // path.resolve() создает абсолютный путь из относительных частей
        path: path.resolve(__dirname, 'dist/client'), // Абсолютный путь куда сохранить сборку (__dirname - родительская директория)
        clean: true,   // Очищать папку output перед каждой сборкой
        // генерирует ES модули (вместо CommonJS)
        module: true, // esm-вывод
        // Настройки библиотеки - как экспортировать код
        library: { 
          type: 'module',
          // Экспортируем DeliveryState глобально для доступа извне
          // Это делает DeliveryState доступной как именованный экспорт
          export: 'DeliveryState'
        }
      },
      // Экспериментальные функции Webpack
      experiments: {
        outputModule: true  // Включить поддержку output модулей (без поддержки output модулей Webpack генерирует CommonJS и генерирует ES модули)
      },
      // Настройки разрешения модулей
      resolve: {
        extensions: ['.js', '.html'] // Расширения файлов которые Webpack будет искать при импортах
      },
      // ТИП ВНЕШНИХ ЗАВИСИМОСТЕЙ (EXTERNALS)
      // Внешние зависимости не включаются в сборку, а подключаются извне
      //alt-модули как esm-externals, а не как глобальные переменные.
      externalsType: 'module',  // указывает что внешние зависимости это ES модули
      //внешние зависимости, эти модули не будут включены в сборку, а будут импортироваться из alt:V
      externals: {
        'alt-client': 'alt-client',
        'natives': 'natives',
        'alt-shared': 'alt-shared'
      },
      module: commonModule, // общие настройки для правил загрузчиков (LOADERS)
      //оптимизация сборки
      optimization: {
        minimize: isProduction, // Минифицировать код в production режиме
        splitChunks: false
      },
/*
      // ДОБАВЛЯЕМ PLUGINS ДЛЯ ProvidePlugin
      plugins: [
        new webpack.ProvidePlugin({
          // ProvidePlugin автоматически предоставляет DeliveryState как глобальную переменную
          // Когда Webpack видит 'DeliveryState' в коде, он автоматически подставляет импорт из Consts.js
          DeliveryState: [
            path.resolve(__dirname, 'shared/Consts.js'), // абсолютный путь к файлу
            'DeliveryState' // имя экспорта из файла
          ]
        })
      ],
*/
    // ИСТОЧНИКИ ДЛЯ ОТЛАДКИ (SOURCE MAPS) (связывают собранный код с исходниками)
     devtool: false // Отключаем source maps (alt:V devtools могут некорректно работать с source maps )
    },

    // Серверная сборка (esm). Не бандлим alt-server/alt-shared — оставляем как внешние esm-модули.
    {
      name: 'server', // имя конфигурации для отладки
      entry: './server/startServer.js', // Точка входа - главный файл серверной части, Webpack начнет сборку с этого файла и найдет все импорты 
      mode: isProduction ? 'production' : 'development', // режим сборки влияет на оптимизацию
      // Целевая среда - Node.js версии 16
      // Важно для корректной работы с ES модулями в Node.js (path, fs)
      target: 'node16', 
      // Настройки выходных файлов
      output: {
        filename: 'server.js',  // Имя итогового файла
        // path.resolve() создает абсолютный путь из относительных частей
        path: path.resolve(__dirname, 'dist/server'), // Абсолютный путь куда сохранить сборку (__dirname - родительская директория)
        clean: true,  // Очищать папку output перед каждой сборкой
        // генерирует ES модули (вместо CommonJS)
        module: true, // esm-вывод
        // Настройки библиотеки - как экспортировать код
        library: { type: 'module' } // Использовать ES модули для экспорта
      },
      // Экспериментальные функции Webpack
      experiments: {
        outputModule: true // Включить поддержку output модулей
      },
      // Настройки разрешения модулей
      resolve: {
        extensions: ['.js'] // Расширения файлов которые Webpack будет искать при импортах
      },
      // ТИП ВНЕШНИХ ЗАВИСИМОСТЕЙ (EXTERNALS)
      // Внешние зависимости не включаются в сборку, а подключаются извне
      //alt-модули как esm-externals, а не как глобальные переменные
      externalsType: 'module',
      //внешние зависимости, эти модули не будут включены в сборку, а будут импортироваться из alt:V
      externals: {
        'alt-server': 'alt-server',
        'alt:chat' : 'alt:chat',
        'alt-shared': 'alt-shared'
      },
      module: commonModule, // общие настройки для правил загрузчиков (LOADERS)
      //оптимизация сборки
      optimization: {
        minimize: isProduction  // Минифицировать код в production режиме
    /*
    production:
    Удаляются комментарии
    Сокращаются имена переменныех
    Удаляются лишние пробелы, переносы
    Оптимизируются выражения
    */
   /*
   development:
    Без минификации
    Включает имена модулей
    Оптимизация скорости
  */
      },
      devtool: false
    }
  ];
};