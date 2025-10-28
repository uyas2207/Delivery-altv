import * as __WEBPACK_EXTERNAL_MODULE_alt_client_680395b4__ from "alt-client";
import * as __WEBPACK_EXTERNAL_MODULE_natives__ from "natives";
/******/ var __webpack_modules__ = ({

/***/ "./client/html/index.html?raw":
/*!************************************!*\
  !*** ./client/html/index.html?raw ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ("<!DOCTYPE html>\r\n<html>\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <style>\r\n        * {\r\n            margin: 0;\r\n            padding: 0;\r\n            box-sizing: border-box;\r\n        }\r\n        \r\n        .notification {\r\n            position: absolute;\r\n            top: 15%;\r\n            left: 50%;\r\n            transform: translateX(-50%);\r\n            background: linear-gradient(135deg, #c0392b, #e74c3c);\r\n            color: white;\r\n            padding: 15px 25px;\r\n            border-radius: 8px;\r\n            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\r\n            text-align: center;\r\n            display: none;\r\n            border: 2px solid #e74c3c;\r\n            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);\r\n            z-index: 9999;\r\n            min-width: 300px;\r\n            opacity: 0;\r\n            transition: opacity 0.3s ease;\r\n        }\r\n        \r\n        .notification.show {\r\n            display: block;\r\n            opacity: 1;\r\n        }\r\n        \r\n        .notification-title {\r\n            font-size: 18px;\r\n            font-weight: bold;\r\n            margin-bottom: 8px;\r\n            color: #ffcc00;\r\n        }\r\n        \r\n        .notification-text {\r\n            font-size: 16px;\r\n            margin-bottom: 12px;\r\n            line-height: 1.4;\r\n        }\r\n        \r\n        .notification-key {\r\n            display: inline-block;\r\n            background: #ffcc00;\r\n            color: #333;\r\n            padding: 4px 8px;\r\n            border-radius: 4px;\r\n            font-weight: bold;\r\n            margin: 0 5px;\r\n        }\r\n    </style>\r\n</head>\r\n<body>\r\n    <div id=\"notification\" class=\"notification\">\r\n        <div class=\"notification-title\" id=\"notificationTitle\">Уведомление</div>\r\n        <div class=\"notification-text\" id=\"notificationText\"></div>\r\n    </div>\r\n\r\n    <script>\r\n        const notification = document.getElementById('notification');\r\n        const notificationTitle = document.getElementById('notificationTitle');\r\n        const notificationText = document.getElementById('notificationText');\r\n        \r\n        let currentNotificationId = null;\r\n        \r\n        // Функция для показа уведомлений\r\n        window.showNotification = function(id, title, text) {\r\n            notificationTitle.textContent = title || 'Уведомление';\r\n            notificationText.innerHTML = text;\r\n            notification.classList.add('show');\r\n            currentNotificationId = id;\r\n            return id;\r\n        };\r\n        \r\n        // Функция для скрытия уведомлений\r\n        window.hideNotification = function(id) {\r\n            if (!id || currentNotificationId === id) {\r\n                notification.classList.remove('show');\r\n                currentNotificationId = null;\r\n            }\r\n        };\r\n        \r\n        // Обработка сообщений от Alt:V\r\n        if ('alt' in window) {\r\n            alt.on('showPersistentNotification', (id, title, text) => {\r\n                showNotification(id, title, text);\r\n            });\r\n            \r\n            alt.on('hidePersistentNotification', (id) => {\r\n                hideNotification(id);\r\n            });\r\n        }\r\n    </script>\r\n</body>\r\n</html>");

/***/ }),

/***/ "alt-client":
/*!*****************************!*\
  !*** external "alt-client" ***!
  \*****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt_client_680395b4__;

/***/ }),

/***/ "natives":
/*!**************************!*\
  !*** external "natives" ***!
  \**************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_natives__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!**************************!*\
  !*** ./shared/Consts.js ***!
  \**************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DeliveryState: () => (/* binding */ DeliveryState)
/* harmony export */ });
// создает глобальный объект напрямую
var DeliveryState = {
  EMPTY: 'empty',
  SELECTING_POINTS: 'selecting_points',
  WAITING_FOR_LOADING: 'waiting_for_loading',
  DELIVERING: 'delivering',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
};
globalThis.DeliveryState = DeliveryState; //делает переменную глобавльной
})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!*******************************!*\
  !*** ./client/startClient.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var natives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! natives */ "natives");
/* harmony import */ var _html_index_html_raw__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./html/index.html?raw */ "./client/html/index.html?raw");
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


 // добавляем ?raw чтобы raw-loader отработал

//вызов гташных уведмолени с помощью нативок 
function drawNotification(message) {
  var autoHide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  natives__WEBPACK_IMPORTED_MODULE_1__.beginTextCommandThefeedPost('STRING');
  natives__WEBPACK_IMPORTED_MODULE_1__.addTextComponentSubstringPlayerName(message);
  var notificationId = natives__WEBPACK_IMPORTED_MODULE_1__.endTextCommandThefeedPostTicker(false, false);
  // Таймер для скрытия уведомления через 3 секунды если кроме текста сообщения также передали true
  if (autoHide) {
    setTimeout(() => {
      natives__WEBPACK_IMPORTED_MODULE_1__.thefeedRemoveItem(notificationId);
    }, 3000);
  }
}
//для вызова уведомлений со стороны сервера
alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('drawNotification', drawNotification);

//уведомления через WebView
class NotificationManager {
  //для хранения единственного экземпляра класса
  //глобальный метод для получение экземпляра класса (информации о состоянии WebView)
  static getInstance() {
    if (!this.instance) {
      // если экземпляр не существует создает его
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('instance создан в первый раз:');
      this.instance = new NotificationManager();
    }
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Передан instance:');
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("this.instance: ".concat(JSON.stringify(this.instance, null, '\t')));
    // возвращает существующий или только что созданный экземпляр
    return this.instance;
  }
  constructor() {
    //проверка если NotificationManager уже создан ранее то осатльной код constructor не пройдет (по идее таких ситуаций быть не может)
    if (NotificationManager.instance) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Повторный вызов constructor NotificationManager');
      return NotificationManager.instance;
    }
    this.webView = null;
    this.isInitialized = false;
    this.isWebViewOpen = false;

    //сохраняет созданный экземпляр
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0421\u043E\u0437\u0434\u0430\u043D\u043D\u044B\u0439 \u044D\u043A\u0437\u0435\u043C\u043F\u043B\u044F\u0440: ".concat(JSON.stringify(this, null, '\t')));
    NotificationManager.instance = this;
  }
  initialize() {
    var _this = this;
    return _asyncToGenerator(function* () {
      // если уже инициализирован, ничего не делает (по идее таких ситуаций быть не может)
      if (_this.isInitialized) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('NotificationManager уже инициализирован (ПОВТОРНАЯ ПОПЫТКА ВЫЗОВА INITIALIZE)');
        return;
      }
      // запуск инициализации
      yield _this.init();
    })();
  }
  init() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      _this2.webView = new alt_client__WEBPACK_IMPORTED_MODULE_0__.WebView("data:text/html;charset=UTF-8,".concat(encodeURIComponent(_html_index_html_raw__WEBPACK_IMPORTED_MODULE_2__["default"])));

      //this.webView = new alt.WebView('http://resource/dist/client/html/index.html');

      var loadPromise = new Promise(resolve => {
        _this2.webView.once('load', () => resolve(true));
      });
      var timeoutPromise = new Promise(resolve => {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(() => resolve(false), 10000);
      });
      //если WebView не загрузится за 2 секунды будет isLoaded = false
      var isLoaded = yield Promise.race([loadPromise, timeoutPromise]);
      if (isLoaded) {
        _this2.isInitialized = true;
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Notification manager initialized SUCCESS');
      } else {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Notification manager did not initialize FAILURE (timeout)');
      }
    })();
  }
  showPersistent(title, text) {
    var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (!this.isInitialized) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Notification manager не инициализирован');
      return null;
    }
    var notificationId = id || "persistent_".concat(Date.now());
    this.webView.emit('showPersistentNotification', notificationId, title, text);
    this.isWebViewOpen = true;
    return notificationId;
  }
  hidePersistent(id) {
    if (this.isInitialized) {
      this.webView.emit('hidePersistentNotification', id);
      this.isWebViewOpen = false;
    } else {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Попытка скрыть Notification при isInitialized === null');
      this.isWebViewOpen = false;
    }
  }
}

// Блокировщик транспорта
_defineProperty(NotificationManager, "instance", null);
class VehicleBlocker {
  blockVehicleForThreeSeconds(vehicle) {
    return _asyncToGenerator(function* () {
      return new Promise(resolve => {
        if (vehicle && vehicle.valid) {
          vehicle.frozen = true;
          setTimeout(() => {
            vehicle.frozen = false;
            resolve();
          }, 3000);
        } else {
          resolve(); // Если транспорт невалиден, сразу разрешаем промис
          alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Ошибка, неправильный reslove');
        }
      });
    })();
  }
}

// Класс для создания и уничтожения визуальных элементов точки
class PointVisuals {
  constructor(pointConfig) {
    this.pointConfig = pointConfig;
    this.position = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(pointConfig.x, pointConfig.y, pointConfig.z);
    this.marker = null;
    this.blip = null;
    this.colshape = null;
  }
  create() {
    //Так как colshapeRadius у полицейских учатсков не прописан в конфиге он undefined
    if (this.pointConfig.colshapeRadius === undefined) {
      this.pointConfig.colshapeRadius = 350;
    }
    // Создание маркера
    //у полицейских участков нет маркера в конфиге поэтому он undefined
    if (this.pointConfig.markerType !== undefined) {
      this.marker = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Marker(this.pointConfig.markerType, this.position, new alt_client__WEBPACK_IMPORTED_MODULE_0__.RGBA(this.pointConfig.markerColor[0], this.pointConfig.markerColor[1], this.pointConfig.markerColor[2], this.pointConfig.markerColor[3]));
    }

    // Создание блипа
    this.blip = new alt_client__WEBPACK_IMPORTED_MODULE_0__.PointBlip(this.position.x, this.position.y, this.position.z);
    this.blip.sprite = this.pointConfig.blipSprite;
    this.blip.color = this.pointConfig.blipColor;
    this.blip.name = this.pointConfig.name;
    this.blip.shortRange = this.pointConfig.blipshortRange;

    // Создание колшейпа
    this.colshape = new alt_client__WEBPACK_IMPORTED_MODULE_0__.ColshapeSphere(this.position.x, this.position.y, this.position.z, this.pointConfig.colshapeRadius);
    return this;
  }
  destroy() {
    if (this.marker) this.marker.destroy();
    if (this.blip) this.blip.destroy();
    if (this.colshape) this.colshape.destroy();
  }
}

// Общая система управления доставкой создается при подключении игрока
class DeliveryJobClient {
  constructor() {
    //данные полученные из конфига
    this.config = {
      unloadingPoints: [],
      loadingPoints: [],
      allowedVehicles: [],
      policeStations: []
    };
    this.DeliveryState = null; // Добавляем свойство для хранения DeliveryState

    this.loadingMarkerType = null; //текщая точка погрузки
    this.unloadingMarkerType = null; //текущая точка разгрузк
    this.policeColshapes = []; // Массив для хранения колшейпов полиции

    this.state = null; //текущее состояние системы доставки
    this.currentOrder = null; // В будущем класс для конкретного заказа, пока что null что бы не использовать что либо что относится только к конкретному заказау до того как игрок начнет конкретный заказ

    // this.vehicleBlocker = new VehicleBlocker(); //для блокировки на разгрузке/погрузке

    this.initializeNotificationManager();
    this.init();
  }

  // метод для инициализации NotificationManager
  initializeNotificationManager() {
    return _asyncToGenerator(function* () {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('1. Инициализация NotificationManager');
      // получает экземпляр Singleton (создается при первом вызове)
      var notificationManager = NotificationManager.getInstance();

      //инициализирует WebView
      yield notificationManager.initialize();
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('1. NotificationManager инициализирован через DeliveryJobClient');
    })();
  }
  init() {
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('2. Инициализация системы доставки.');
    // получение данных из конфига с сервера
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initLoadingPoints', points => {
      this.config.loadingPoints = points;
    });
    // получение данных из конфига с сервера
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initUnloadingPoints', points => {
      this.config.unloadingPoints = points;
    });
    // получение данных из конфига с сервера
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initPoliceStations', points => {
      this.config.policeStations = points;
      this.createPoliceBlipsColshapes(); //сразу при входе на сервер будет точка погрузки 
    });
    // получение данных из конфига с сервера
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initAllowedVehicles', VehHash => {
      this.config.allowedVehicles = VehHash;
    });
    // получение DeliveryState с сервера
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initDeliveryState', deliveryState => {
      this.DeliveryState = deliveryState;
      this.state = this.DeliveryState.SELECTING_POINTS; // инициализируем начальное состояние
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('DeliveryState получен и установлен');
    });
    // при старте заказа приходит с сервера client:startDelivery, и начинается заказ на клиенте
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:startDelivery', cargoType => {
      this.startNewOrder(cargoType); //тип груза определяется на сервере
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("cargoType ".concat(cargoType));
    });
    // нужно для очистки информации о грузе при провале доставки
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:cancelDelivery', () => {
      this.cancelCurrentOrder();
    });
    //для очистки обработчиков после выхода игрока с сервера
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:destroyDeliveryJob', () => {
      this.destroy();
    });
    // визуальный взрыв при провале груза типа danger
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer("explode", () => {
      var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;
      natives__WEBPACK_IMPORTED_MODULE_1__.addExplosion(player.vehicle.pos.x, player.vehicle.pos.y, player.vehicle.pos.z, 9,
      // тип взрыва (9 - Vehicle)
      5.0,
      // радиус
      true,
      // звук
      false,
      // невидимый огонь
      0.0,
      // камера shake
      true);
    });
    // Обработка входа/выхода из колшейпов
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('entityEnterColshape', this.handleEnterColshapeDeliveryJobClient.bind(this));
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('entityLeaveColshape', this.handleLeaveColshapeDeliveryJobClient.bind(this));
  }
  //создание полицеских блипов и колшейпов
  createPoliceBlipsColshapes() {
    this.config.policeStations.forEach((station, index) => {
      var policeVisuals = new PointVisuals(station).create();

      // добавление дополнительных свойст для колшейпов после создания создания
      policeVisuals.colshape.isPoliceZone = true; // нужно для проверки что автомобиль попал именно в полицейский колшейп, а не какой то другой
      policeVisuals.colshape.policeStationId = index; //нужно для проверки в какой из полицейских участков заехал автомобиль
      //добавление данных созданной точки в массив
      this.policeColshapes.push(policeVisuals.colshape);
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0421\u043E\u0437\u0434\u0430\u043D\u043E ".concat(this.config.policeStations.length, " \u043F\u043E\u043B\u0438\u0446\u0435\u0439\u0441\u043A\u0438\u0445 \u0443\u0447\u0430\u0441\u0442\u043A\u043E\u0432"));
  }
  // создание заказа доставки 
  startNewOrder(cargoType) {
    //если существует текущий заказ он отменяется
    if (this.currentOrder) {
      this.cancelCurrentOrder();
    }
    // инициализируется класс конкретного заказа только при старте конкретного заказа
    this.currentOrder = new DeliveryOrder(cargoType, this.config, this.policeColshapes, this.DeliveryState // передает DeliveryState в DeliveryOrder
    );
    this.currentOrder.deliveryJobClient = this; // cсылка для последующего обнуления
    this.currentOrder.start(); //старт конкретного заказа в DeliveryOrder
  }
  cancelCurrentOrder() {
    if (this.currentOrder) {
      this.currentOrder.cancel(); //отмена конкретного заказа в DeliveryOrder
      this.currentOrder = null; //обнуление ссылки
    }
  }
  //логика на вход в колшейп
  handleEnterColshapeDeliveryJobClient(colshape, entity) {
    var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;
    //проверка на то что игрок в машине, в доставке если игрок не в машине ничего никогда не происходит
    if (entity instanceof alt_client__WEBPACK_IMPORTED_MODULE_0__.Player) {
      if (!player.vehicle) return;
    }
    // проверка на случай если будут добавлены еще колшейпы и в них зайдет игрок без заказа доставки
    if (this.currentOrder !== null) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0412\u043E\u0448\u0435\u043B \u0432 \u043A\u043E\u043B\u0448\u0435\u0439\u043F");
      this.currentOrder.handleColshapeEnterDeliveryOrder(colshape); //логика входа в колшейп у конкретного заказа
    }
  }
  //выход из колшейпа
  handleLeaveColshapeDeliveryJobClient(colshape, entity) {
    if (NotificationManager.getInstance().isWebViewOpen) {
      NotificationManager.getInstance().hidePersistent();
      //очищает обработчик нажатия клавиши (который создается только при открытии WebViewOpen, поэтому в других случаях его можно не очищать)
      this.currentOrder.handleColshapeLeave(colshape, entity);
    }
  }
}

// Конкретный заказ на клиенте, создается только при старте доставки у конкретного игрока (не при входе на сервер)
class DeliveryOrder {
  constructor(cargoType, config, policeColshapes, DeliveryState) {
    //Данные из конфига
    this.cargoType = cargoType; //тип груза CommonCargo, HardCargo, DangerCargo, IllegalCargo
    this.config = config; // (все loadingPoints, все unloadingPoints, все allowedVehicles, все policeStations)
    this.policeColshapes = policeColshapes;
    this.DeliveryState = DeliveryState; // сохраняет DeliveryState

    this.state = this.DeliveryState.SELECTING_POINTS; // использует константу из DeliveryState 'selecting_points'	изначальное состояние при старте системы
    this.loadingPoint = null; //текущая точка погрузки
    this.unloadingPoint = null; //текущая точка разгрузки
    this.loadedVehId = null; //сетевой id загруженной машины
    this.deliveryJobClient = null; //переменная для хранения ссылки

    this.pointBaseType = {
      LOADING: 'loading',
      UNLOADING: 'unloading'
    }; // тип точки передается в Pointbase (и нигде не используется)
  }
  start() {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      yield _this3.selectPoints();
      _this3.createLoadingPoint();
      _this3.state = _this3.DeliveryState.WAITING_FOR_LOADING; //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
    })();
  }
  selectPoints() {
    return new Promise(resolve => {
      // Выбор случайных точек            
      this.loadingPoint = this.config.loadingPoints[Math.floor(Math.random() * this.config.loadingPoints.length)];
      this.unloadingPoint = this.config.unloadingPoints[Math.floor(Math.random() * this.config.unloadingPoints.length)];

      // Проверка для нелегального груза
      if (this.cargoType === 'Illegal') {
        this.distanceFromPoliceStations();
      }
      resolve();
    });
  }
  // Проверка расстояния от выбранной точки разгрузки до полицейских участков
  distanceFromPoliceStations() {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      var minDistance = 350;

      // unloadingPoint в Vector3 для расчета расстояния
      var unloadingPos = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(_this4.unloadingPoint.x, _this4.unloadingPoint.y, _this4.unloadingPoint.z);
      var isTooClose = _this4.config.policeStations.some(station => {
        var stationPos = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(station.x, station.y, station.z);
        var distance = unloadingPos.distanceTo(stationPos);
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u043F\u043E\u043B\u0438\u0446\u0435\u0439\u0441\u043A\u043E\u0433\u043E \u0443\u0447\u0430\u0441\u0442\u043A\u0430 ".concat(station.name, ": ").concat(distance));
        return distance < minDistance; //если distance меньше чем 350 isTooClose = true 
      });
      if (isTooClose) {
        // Перевыбираем точку разгрузки, не меняя точки погрузки
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0422\u043E\u0447\u043A\u0430 \u0440\u0430\u0437\u0433\u0440\u0443\u0437\u043A\u0438 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043F\u043E\u043B\u0438\u0446\u0438\u0438, \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u043D\u0442\u0441\u044F \u043D\u043E\u0432\u0430\u044F...");
        _this4.unloadingPoint = _this4.config.unloadingPoints[Math.floor(Math.random() * _this4.config.unloadingPoints.length)];
        _this4.distanceFromPoliceStations(); // Рекурсивная проверка
        //если вдруг будет в конфиге слишком много точек близко к полиции что бы были временные промежутки между проверками (+ можно доавбить ограничение на количество повторных выборов точки разгрузки)
        yield new Promise(resolve => alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolve, 10));
      }
    })();
  }
  createLoadingPoint() {
    // создает визуальные элементы (маркеры, блипы и колшейпы)
    var pointVisuals = new PointVisuals(this.loadingPoint).create();

    // создает PointBase с поведением (логика точки погрузки/разгрузки)
    this.loadingPoint = new PointBase(this.pointBaseType.LOADING, this, pointVisuals);
  }
  createUnloadingPoint() {
    // создает визуальные элементы (маркеры, блипы и колшейпы)
    var pointVisuals = new PointVisuals(this.unloadingPoint).create();

    // создает PointBase с поведением (логика точки погрузки/разгрузки)
    this.unloadingPoint = new PointBase(this.pointBaseType.UNLOADING, this, pointVisuals);
  }
  handleColshapeEnterDeliveryOrder(colshape) {
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("alt.Player.local.vehicle.id: ".concat(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle.id));

    // если в будущем будет добавлено больше колшейпов проверка handleColshapeEnterDeliveryOrder будет return
    if (!this.loadingPoint || !this.unloadingPoint || !this.policeColshapes) return;
    // если 'waiting_for_loading' значит колшейп точки погрузки
    if (this.state === this.DeliveryState.WAITING_FOR_LOADING) {
      //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
      if (colshape === this.loadingPoint.pointVisuals.colshape) {
        this.loadingPoint.PointLoad(colshape, alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle);
      }
    }
    //если 'delivering' значит колшейп точки разгрузки
    if (this.state === this.DeliveryState.DELIVERING) {
      //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
      if (colshape === this.unloadingPoint.pointVisuals.colshape) {
        this.unloadingPoint.PointUnload(colshape, alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle);
      }
    }
    //если колшейп полицейский и груз Illegal и в колшейп вошли на загруженной машине
    if (colshape.isPoliceZone) {
      if (this.cargoType === 'Illegal' && alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle.id === this.loadedVehId) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:failDelivery'); //отправляет на сервер информацию о провале доставки
      }
    }
  }
  handleColshapeLeave(colshape) {
    // Очищаем обработчики клавиш при выходе из колшейпа (только если открыта webview)
    if (this.state === this.DeliveryState.WAITING_FOR_LOADING && this.loadingPoint) {
      //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
      this.loadingPoint.cleanup();
    }
    if (this.state === this.DeliveryState.DELIVERING && this.unloadingPoint) {
      //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
      this.unloadingPoint.cleanup();
    }
  }
  //процесс погрзки (после проверки на соблюдение всех необходимых для нее требований)
  executeLoading(vehicle) {
    var _this5 = this;
    return _asyncToGenerator(function* () {
      var vehicleBlocker = new VehicleBlocker();
      drawNotification('Начало погрузки...', true); //true значит что уведмоление пропадет через 3 чекунды
      yield vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится

      _this5.loadedVehId = vehicle.id;
      _this5.loadingPoint.pointVisuals.destroy();
      _this5.createUnloadingPoint();
      _this5.state = _this5.DeliveryState.DELIVERING; //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)

      drawNotification("\u041F\u043E\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u0413\u0440\u0443\u0437: ".concat(_this5.cargoType));
      alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:startLoading', _this5.loadedVehId); //передает на сервер что игрок погрузил груз
    })();
  }
  //процесс разгрузки (после проверки на соблюдение всех необходимых для нее требований)
  executeUnloading(vehicle) {
    var _this6 = this;
    return _asyncToGenerator(function* () {
      var vehicleBlocker = new VehicleBlocker();
      drawNotification('Начало разгрузки...', true); //true значит что уведмоление пропадет через 3 чекунды
      yield vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится

      _this6.loadedVehId = null;
      _this6.unloadingPoint.pointVisuals.destroy();
      _this6.state = _this6.DeliveryState.EMPTY; //'empty'			нет активного заказа (провален или выполнен)

      alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:completeDelivery');
      drawNotification("\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u0413\u0440\u0443\u0437: ".concat(_this6.cargoType));
      _this6.deliveryJobClient.currentOrder = null;
    })();
  }
  cancel() {
    // полная очистка ресурсов
    if (this.state === this.DeliveryState.WAITING_FOR_LOADING) {
      //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
      this.loadingPoint.cleanup();
      this.loadingPoint.pointVisuals.destroy();
      this.state = this.DeliveryState.EMPTY; //'empty'			нет активного заказа (провален или выполнен)
    }
    if (this.state === this.DeliveryState.DELIVERING) {
      //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
      this.unloadingPoint.cleanup();
      this.unloadingPoint.pointVisuals.destroy();
      this.loadedVehId = null;
      this.state = this.DeliveryState.EMPTY; //'empty'			нет активного заказа (провален или выполнен)
    }

    // обнуление в родители
    if (this.deliveryJobClient) {
      this.deliveryJobClient.currentOrder = null;
    }
  }
}

// Класс точки с логикой для точки погрузки/разгрузки
class PointBase {
  constructor(type, deliveryOrder, pointVisuals) {
    this.type = type; //по идее не нужен, так как нигде не используется
    this.deliveryOrder = deliveryOrder;
    this.pointVisuals = pointVisuals;
    this.keyPressHandler = null; // свойство для хранения обработчика
  }

  // метод PointLoad - инкапсулирует поведение точки погрузки
  PointLoad(colshape, entity) {
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("PointLoad");
    var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;

    // проверка на разрешенные модели авто
    if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) {
      drawNotification('Транспорт не подходит для перевозки');
      return;
    }
    NotificationManager.getInstance().showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");

    //таких ситуаций в текущем коде быть не может, проверка есть на случай если потом будут добавлены еще обработчки при расширении функционала доставки
    if (this.keyPressHandler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keydown', this.keyPressHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Удален обработчик 1');
    }

    // Создает новый обработчик для клавиши E
    this.keyPressHandler = key => {
      //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
      if (key === 69 && NotificationManager.getInstance().isWebViewOpen && this.pointVisuals.position.distanceTo(player.pos) < 10) {
        // удаляет обработчик после нажатия
        this.cleanup();
        NotificationManager.getInstance().hidePersistent(); //скрыть WebView
        if (!player.vehicle) {
          // если игрок заехал в колшеп на транспорте но вышел и нажал E ничего не происходит (WebView закрылось ранее поэтому ему придется перезаезжать в колшейп)
          drawNotification('Вы не находитесь в транспорте');
          return;
        }
        if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) {
          // снова проверка на правильное авто (вдруг игрок заехал в колшейп на правильном авто и невыходя из колшейпа пересел в неправильное авто)
          alt_client__WEBPACK_IMPORTED_MODULE_0__.log("Vehicle ".concat(player.vehicle.model, " is not allowed"));
          drawNotification('Неправильное авто');
          return;
        }
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Началась погрузка');
        this.deliveryOrder.executeLoading(player.vehicle);
      }
    };

    // регистрирует обработчик
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keydown', this.keyPressHandler);
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Создан обработчик погрузки');
  }

  // метод PointUnload - инкапсулирует поведение точки разгрузки
  PointUnload(colshape, entity) {
    var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;

    // проверка что это тот же транспорт что и был загружке
    if (this.deliveryOrder.loadedVehId !== player.vehicle.id) {
      drawNotification('Это не тот транспорт, в который был загружен груз');
      return;
    }
    NotificationManager.getInstance().showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");
    this.keyPressHandler = key => {
      //проверка на нажатие E и соблюдение всех необходимых условий для разгрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
      if (key === 69 && NotificationManager.getInstance().isWebViewOpen && this.pointVisuals.position.distanceTo(player.pos) < 15) {
        // удаляет обработчик после нажатия
        this.cleanup();
        NotificationManager.getInstance().hidePersistent(); //скрыть WebView
        //проверку ниже можно убрать, так как если игрок вышел из авто и/или пересел в другую машину ему это не даст никакого приемущества (но для логики игрового процесса стоит остаивть)
        if (!player.vehicle) {
          // Если игрок заехал в колшеп на транспорте но вышел и нажал E ничего не происходит (WebView закрылось ранее поэтому ему придется перезаезжать в колшейп)
          drawNotification('Вы не находитесь в транспорте');
          return;
        }
        if (this.deliveryOrder.loadedVehId !== player.vehicle.id) {
          //если игрок заехал на загруженном транспорте, но не выходя из колшейпа пересел в другое авто (проверка для того что бы не нарушалась логика игрового процесса) 
          drawNotification('Это не тот транспорт, в который был загружен груз');
          return;
        }
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Началась разгрузка');
        this.deliveryOrder.executeUnloading(player.vehicle);
      }
    };

    // регистрирует обработчик
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keydown', this.keyPressHandler);
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Создан обработчик разгрузки');
  }

  // метод для очистки обработчика keyPressHandler
  cleanup() {
    if (this.keyPressHandler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keydown', this.keyPressHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Удален обработчик');
      this.keyPressHandler = null;
    }
  }
}
new DeliveryJobClient();
})();

