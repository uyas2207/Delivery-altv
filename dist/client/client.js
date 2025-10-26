import * as __WEBPACK_EXTERNAL_MODULE_alt_client_680395b4__ from "alt-client";
import * as __WEBPACK_EXTERNAL_MODULE_natives__ from "natives";
/******/ var __webpack_modules__ = ({

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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./client/startClient.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var alt_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-client */ "alt-client");
/* harmony import */ var natives__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! natives */ "natives");
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



// Функция для уведомлений GTA
function drawNotification(message) {
  var autoHide = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  natives__WEBPACK_IMPORTED_MODULE_1__.beginTextCommandThefeedPost('STRING');
  natives__WEBPACK_IMPORTED_MODULE_1__.addTextComponentSubstringPlayerName(message);
  var notificationId = natives__WEBPACK_IMPORTED_MODULE_1__.endTextCommandThefeedPostTicker(false, false);
  if (autoHide) {
    setTimeout(() => {
      natives__WEBPACK_IMPORTED_MODULE_1__.thefeedRemoveItem(notificationId);
    }, 3000);
  }
}

// Обработчик серверных уведомлений
alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('drawNotification', drawNotification);

// Менеджер уведомлений через WebView
class NotificationManager {
  static getInstance() {
    if (!this.instance) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('instance создан в первый раз:');
      this.instance = new NotificationManager();
    }
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Передан instance:');
    return this.instance;
  }
  constructor() {
    if (NotificationManager.instance) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Повторный вызов constructor NotificationManager');
      return NotificationManager.instance;
    }
    this.webView = null;
    this.isInitialized = false;
    this.isWebViewOpen = false;
    NotificationManager.instance = this;
  }
  initialize() {
    var _this = this;
    return _asyncToGenerator(function* () {
      if (_this.isInitialized) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('NotificationManager уже инициализирован');
        return;
      }
      yield _this.init();
    })();
  }
  init() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      _this2.webView = new alt_client__WEBPACK_IMPORTED_MODULE_0__.WebView('http://resource/client/html/index.html');
      var loadPromise = new Promise(resolve => {
        _this2.webView.once('load', () => resolve(true));
      });
      var timeoutPromise = new Promise(resolve => {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(() => resolve(false), 2000);
      });
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
          resolve();
          alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Ошибка, неправильный resolve');
        }
      });
    })();
  }
}

// Визуальные элементы точки
class PointVisuals {
  constructor(pointConfig) {
    this.pointConfig = pointConfig;
    this.position = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(pointConfig.x, pointConfig.y, pointConfig.z);
    this.marker = null;
    this.blip = null;
    this.colshape = null;
  }
  create() {
    if (this.pointConfig.colshapeRadius === undefined) {
      this.pointConfig.colshapeRadius = 350;
    }
    if (this.pointConfig.markerType !== undefined) {
      this.marker = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Marker(this.pointConfig.markerType, this.position, new alt_client__WEBPACK_IMPORTED_MODULE_0__.RGBA(this.pointConfig.markerColor[0], this.pointConfig.markerColor[1], this.pointConfig.markerColor[2], this.pointConfig.markerColor[3]));
    }
    this.blip = new alt_client__WEBPACK_IMPORTED_MODULE_0__.PointBlip(this.position.x, this.position.y, this.position.z);
    this.blip.sprite = this.pointConfig.blipSprite;
    this.blip.color = this.pointConfig.blipColor;
    this.blip.name = this.pointConfig.name;
    this.blip.shortRange = this.pointConfig.blipshortRange;
    this.colshape = new alt_client__WEBPACK_IMPORTED_MODULE_0__.ColshapeSphere(this.position.x, this.position.y, this.position.z, this.pointConfig.colshapeRadius);
    return this;
  }
  destroy() {
    if (this.marker) this.marker.destroy();
    if (this.blip) this.blip.destroy();
    if (this.colshape) this.colshape.destroy();
  }
}

// Основная система доставки на клиенте
class DeliveryJobClient {
  constructor() {
    this.config = {
      unloadingPoints: [],
      loadingPoints: [],
      allowedVehicles: [],
      policeStations: []
    };
    this.DeliveryState = null;
    this.loadingMarkerType = null;
    this.unloadingMarkerType = null;
    this.policeColshapes = [];
    this.state = null;
    this.currentOrder = null;
    this.initializeNotificationManager();
    this.init();
  }
  initializeNotificationManager() {
    return _asyncToGenerator(function* () {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('1. Инициализация NotificationManager');
      var notificationManager = NotificationManager.getInstance();
      yield notificationManager.initialize();
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('1. NotificationManager инициализирован через DeliveryJobClient');
    })();
  }
  init() {
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('2. Инициализация системы доставки.');
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initLoadingPoints', points => {
      this.config.loadingPoints = points;
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initUnloadingPoints', points => {
      this.config.unloadingPoints = points;
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initPoliceStations', points => {
      this.config.policeStations = points;
      this.createPoliceBlipsColshapes();
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initAllowedVehicles', VehHash => {
      this.config.allowedVehicles = VehHash;
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('initDeliveryState', deliveryState => {
      this.DeliveryState = deliveryState;
      this.state = this.DeliveryState.SELECTING_POINTS;
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('DeliveryState получен и установлен');
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:startDelivery', cargoType => {
      this.startNewOrder(cargoType);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("cargoType ".concat(cargoType));
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:cancelDelivery', () => {
      this.cancelCurrentOrder();
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer('client:destroyDeliveryJob', () => {
      this.destroy();
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.onServer("explode", () => {
      var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;
      if (player.vehicle) {
        natives__WEBPACK_IMPORTED_MODULE_1__.addExplosion(player.vehicle.pos.x, player.vehicle.pos.y, player.vehicle.pos.z, 9, 5.0, true, false, 0.0, true);
      }
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('entityEnterColshape', this.handleEnterColshapeDeliveryJobClient.bind(this));
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('entityLeaveColshape', this.handleLeaveColshapeDeliveryJobClient.bind(this));
  }
  createPoliceBlipsColshapes() {
    this.config.policeStations.forEach((station, index) => {
      var policeVisuals = new PointVisuals(station).create();
      policeVisuals.colshape.isPoliceZone = true;
      policeVisuals.colshape.policeStationId = index;
      this.policeColshapes.push(policeVisuals.colshape);
    });
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0421\u043E\u0437\u0434\u0430\u043D\u043E ".concat(this.config.policeStations.length, " \u043F\u043E\u043B\u0438\u0446\u0435\u0439\u0441\u043A\u0438\u0445 \u0443\u0447\u0430\u0441\u0442\u043A\u043E\u0432"));
  }
  startNewOrder(cargoType) {
    if (this.currentOrder) {
      this.cancelCurrentOrder();
    }
    this.currentOrder = new DeliveryOrder(cargoType, this.config, this.policeColshapes, this.DeliveryState);
    this.currentOrder.deliveryJobClient = this;
    this.currentOrder.start();
  }
  cancelCurrentOrder() {
    if (this.currentOrder) {
      this.currentOrder.cancel();
      this.currentOrder = null;
    }
  }
  handleEnterColshapeDeliveryJobClient(colshape, entity) {
    var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;
    if (entity instanceof alt_client__WEBPACK_IMPORTED_MODULE_0__.Player) {
      if (!player.vehicle) return;
    }
    if (this.currentOrder !== null) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0412\u043E\u0448\u0435\u043B \u0432 \u043A\u043E\u043B\u0448\u0435\u0439\u043F");
      this.currentOrder.handleColshapeEnterDeliveryOrder(colshape);
    }
  }
  handleLeaveColshapeDeliveryJobClient(colshape, entity) {
    if (NotificationManager.getInstance().isWebViewOpen) {
      NotificationManager.getInstance().hidePersistent();
      this.currentOrder.handleColshapeLeave(colshape, entity);
    }
  }
}

// Конкретный заказ на клиенте
class DeliveryOrder {
  constructor(cargoType, config, policeColshapes, DeliveryState) {
    this.cargoType = cargoType;
    this.config = config;
    this.policeColshapes = policeColshapes;
    this.DeliveryState = DeliveryState;
    this.state = this.DeliveryState.SELECTING_POINTS;
    this.loadingPoint = null;
    this.unloadingPoint = null;
    this.loadedVehId = null;
    this.deliveryJobClient = null;
    this.pointBaseType = {
      LOADING: 'loading',
      UNLOADING: 'unloading'
    };
  }
  start() {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      yield _this3.selectPoints();
      _this3.createLoadingPoint();
      _this3.state = _this3.DeliveryState.WAITING_FOR_LOADING;
    })();
  }
  selectPoints() {
    return new Promise(resolve => {
      this.loadingPoint = this.config.loadingPoints[Math.floor(Math.random() * this.config.loadingPoints.length)];
      this.unloadingPoint = this.config.unloadingPoints[Math.floor(Math.random() * this.config.unloadingPoints.length)];
      if (this.cargoType === 'Illegal') {
        this.distanceFromPoliceStations();
      }
      resolve();
    });
  }
  distanceFromPoliceStations() {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      var minDistance = 350;
      var unloadingPos = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(_this4.unloadingPoint.x, _this4.unloadingPoint.y, _this4.unloadingPoint.z);
      var isTooClose = _this4.config.policeStations.some(station => {
        var stationPos = new alt_client__WEBPACK_IMPORTED_MODULE_0__.Vector3(station.x, station.y, station.z);
        var distance = unloadingPos.distanceTo(stationPos);
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u043F\u043E\u043B\u0438\u0446\u0435\u0439\u0441\u043A\u043E\u0433\u043E \u0443\u0447\u0430\u0441\u0442\u043A\u0430 ".concat(station.name, ": ").concat(distance));
        return distance < minDistance;
      });
      if (isTooClose) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log("\u0422\u043E\u0447\u043A\u0430 \u0440\u0430\u0437\u0433\u0440\u0443\u0437\u043A\u0438 \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043F\u043E\u043B\u0438\u0446\u0438\u0438, \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u043D\u0442\u0441\u044F \u043D\u043E\u0432\u0430\u044F...");
        _this4.unloadingPoint = _this4.config.unloadingPoints[Math.floor(Math.random() * _this4.config.unloadingPoints.length)];
        _this4.distanceFromPoliceStations();
        yield new Promise(resolve => alt_client__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolve, 10));
      }
    })();
  }
  createLoadingPoint() {
    var pointVisuals = new PointVisuals(this.loadingPoint).create();
    this.loadingPoint = new PointBase(this.pointBaseType.LOADING, this, pointVisuals);
  }
  createUnloadingPoint() {
    var pointVisuals = new PointVisuals(this.unloadingPoint).create();
    this.unloadingPoint = new PointBase(this.pointBaseType.UNLOADING, this, pointVisuals);
  }
  handleColshapeEnterDeliveryOrder(colshape) {
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("alt.Player.local.vehicle.id: ".concat(alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle.id));
    if (!this.loadingPoint || !this.unloadingPoint || !this.policeColshapes) return;
    if (this.state === this.DeliveryState.WAITING_FOR_LOADING) {
      if (colshape === this.loadingPoint.pointVisuals.colshape) {
        this.loadingPoint.PointLoad(colshape, alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle);
      }
    }
    if (this.state === this.DeliveryState.DELIVERING) {
      if (colshape === this.unloadingPoint.pointVisuals.colshape) {
        this.unloadingPoint.PointUnload(colshape, alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle);
      }
    }
    if (colshape.isPoliceZone) {
      if (this.cargoType === 'Illegal' && alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local.vehicle.id === this.loadedVehId) {
        alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:failDelivery');
      }
    }
  }
  handleColshapeLeave(colshape) {
    if (this.state === this.DeliveryState.WAITING_FOR_LOADING && this.loadingPoint) {
      this.loadingPoint.cleanup();
    }
    if (this.state === this.DeliveryState.DELIVERING && this.unloadingPoint) {
      this.unloadingPoint.cleanup();
    }
  }
  executeLoading(vehicle) {
    var _this5 = this;
    return _asyncToGenerator(function* () {
      var vehicleBlocker = new VehicleBlocker();
      drawNotification('Начало погрузки...', true);
      yield vehicleBlocker.blockVehicleForThreeSeconds(vehicle);
      _this5.loadedVehId = vehicle.id;
      _this5.loadingPoint.pointVisuals.destroy();
      _this5.createUnloadingPoint();
      _this5.state = _this5.DeliveryState.DELIVERING;
      drawNotification("\u041F\u043E\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u0413\u0440\u0443\u0437: ".concat(_this5.cargoType));
      alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:startLoading', _this5.loadedVehId);
    })();
  }
  executeUnloading(vehicle) {
    var _this6 = this;
    return _asyncToGenerator(function* () {
      var vehicleBlocker = new VehicleBlocker();
      drawNotification('Начало разгрузки...', true);
      yield vehicleBlocker.blockVehicleForThreeSeconds(vehicle);
      _this6.loadedVehId = null;
      _this6.unloadingPoint.pointVisuals.destroy();
      _this6.state = _this6.DeliveryState.EMPTY;
      alt_client__WEBPACK_IMPORTED_MODULE_0__.emitServer('client:completeDelivery');
      drawNotification("\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430! \u0413\u0440\u0443\u0437: ".concat(_this6.cargoType));
      _this6.deliveryJobClient.currentOrder = null;
    })();
  }
  cancel() {
    if (this.state === this.DeliveryState.WAITING_FOR_LOADING) {
      this.loadingPoint.cleanup();
      this.loadingPoint.pointVisuals.destroy();
      this.state = this.DeliveryState.EMPTY;
    }
    if (this.state === this.DeliveryState.DELIVERING) {
      this.unloadingPoint.cleanup();
      this.unloadingPoint.pointVisuals.destroy();
      this.loadedVehId = null;
      this.state = this.DeliveryState.EMPTY;
    }
    if (this.deliveryJobClient) {
      this.deliveryJobClient.currentOrder = null;
    }
  }
}

// Класс точки с логикой
class PointBase {
  constructor(type, deliveryOrder, pointVisuals) {
    this.type = type;
    this.deliveryOrder = deliveryOrder;
    this.pointVisuals = pointVisuals;
    this.keyPressHandler = null;
  }
  PointLoad(colshape, entity) {
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log("PointLoad");
    var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;
    if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) {
      drawNotification('Транспорт не подходит для перевозки');
      return;
    }
    NotificationManager.getInstance().showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");
    if (this.keyPressHandler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keydown', this.keyPressHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Удален обработчик 1');
    }
    this.keyPressHandler = key => {
      if (key === 69 && NotificationManager.getInstance().isWebViewOpen && this.pointVisuals.position.distanceTo(player.pos) < 10) {
        this.cleanup();
        NotificationManager.getInstance().hidePersistent();
        if (!player.vehicle) {
          drawNotification('Вы не находитесь в транспорте');
          return;
        }
        if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) {
          alt_client__WEBPACK_IMPORTED_MODULE_0__.log("Vehicle ".concat(player.vehicle.model, " is not allowed"));
          drawNotification('Неправильное авто');
          return;
        }
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Началась погрузка');
        this.deliveryOrder.executeLoading(player.vehicle);
      }
    };
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keydown', this.keyPressHandler);
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Создан обработчик погрузки');
  }
  PointUnload(colshape, entity) {
    var player = alt_client__WEBPACK_IMPORTED_MODULE_0__.Player.local;
    if (this.deliveryOrder.loadedVehId !== player.vehicle.id) {
      drawNotification('Это не тот транспорт, в который был загружен груз');
      return;
    }
    NotificationManager.getInstance().showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");
    this.keyPressHandler = key => {
      if (key === 69 && NotificationManager.getInstance().isWebViewOpen && this.pointVisuals.position.distanceTo(player.pos) < 15) {
        this.cleanup();
        NotificationManager.getInstance().hidePersistent();
        if (!player.vehicle) {
          drawNotification('Вы не находитесь в транспорте');
          return;
        }
        if (this.deliveryOrder.loadedVehId !== player.vehicle.id) {
          drawNotification('Это не тот транспорт, в который был загружен груз');
          return;
        }
        alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Началась разгрузка');
        this.deliveryOrder.executeUnloading(player.vehicle);
      }
    };
    alt_client__WEBPACK_IMPORTED_MODULE_0__.on('keydown', this.keyPressHandler);
    alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Создан обработчик разгрузки');
  }
  cleanup() {
    if (this.keyPressHandler) {
      alt_client__WEBPACK_IMPORTED_MODULE_0__.off('keydown', this.keyPressHandler);
      alt_client__WEBPACK_IMPORTED_MODULE_0__.log('Удален обработчик');
      this.keyPressHandler = null;
    }
  }
}

// Запуск системы
new DeliveryJobClient();
alt_client__WEBPACK_IMPORTED_MODULE_0__.log('=== Cargo Delivery Client Module Loaded ===');
})();

