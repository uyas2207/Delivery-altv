import * as __WEBPACK_EXTERNAL_MODULE_alt_server_bcde031e__ from "alt-server";
import * as __WEBPACK_EXTERNAL_MODULE_alt_chat_aea54472__ from "alt:chat";
import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "node:module";
const __WEBPACK_EXTERNAL_createRequire_require = __WEBPACK_EXTERNAL_createRequire(import.meta.url);
/******/ var __webpack_modules__ = ({

/***/ "./server/cargo/CargoBase.js":
/*!***********************************!*\
  !*** ./server/cargo/CargoBase.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
//для работы функицй alt.

class CargoBase {
  constructor(type, reward, reason) {
    this.type = type;
    this.reward = reward;
    this.reason = reason;
  }
  onDamage(vehicle, attacker, deliveryJob) {
    return _asyncToGenerator(function* () {
      // базовая логика - без обработки урона

      alt_server__WEBPACK_IMPORTED_MODULE_0__.log("CargoBase \u0430\u0432\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E \u0443\u0440\u043E\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A");
      return false; //урон не обработан
    })();
  }
  //общая логика для успешного завершения
  onSuccessfulDelivery(player) {
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'drawNotification', "+".concat(this.reward, "$"));
  }
  //общая логика для провала
  onDeliveryFailed(player) {
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'drawNotification', "".concat(this.reason));
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'drawNotification', 'заказ отменен!');
  }
}
//передается CargoBase для файлов которые будут использовать import CargoBase from './CargoBase.js'
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CargoBase); // default export

/***/ }),

/***/ "./server/cargo/CommonCargo.js":
/*!*************************************!*\
  !*** ./server/cargo/CommonCargo.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CommonCargo: () => (/* binding */ CommonCargo)
/* harmony export */ });
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ "./server/cargo/CargoBase.js");
//для работы функицй alt.
//в этом файле такие функции не используются но вдруг в будущем будет добавлена еще логика и возникнет необходимость в altv функционале

//Берется базовая логика типа груза из shared\cargo /CargoBase.js

class CommonCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor() {
    super('Common', 1000, null); //type, reward, reason
  }
}

/***/ }),

/***/ "./server/cargo/Consts.js":
/*!********************************!*\
  !*** ./server/cargo/Consts.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DeliveryState: () => (/* binding */ DeliveryState)
/* harmony export */ });
var DeliveryState = {
  EMPTY: 'empty',
  //'empty'			нет активного заказа (провален или выполнен)
  SELECTING_POINTS: 'selecting_points',
  ///'selecting_points'	изначальное состояние при старте системы на клиенте
  WAITING_FOR_LOADING: 'waiting_for_loading',
  //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
  DELIVERING: 'delivering',
  //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
  ACTIVE: 'active',
  //используется только на сервере, показывает что заказ только что начался
  COMPLETED: 'completed',
  // используется только на сервере без функционала (нужно для деабага)
  CANCELLED: 'cancelled',
  // используется только на сервере без функционала (нужно для деабага)
  FAILED: 'failed' // используется только на сервере без функционала (нужно для деабага)
};

/***/ }),

/***/ "./server/cargo/DangerCargo.js":
/*!*************************************!*\
  !*** ./server/cargo/DangerCargo.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DangerCargo: () => (/* binding */ DangerCargo)
/* harmony export */ });
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ "./server/cargo/CargoBase.js");
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
//для работы функицй alt.

//Берется базовая логика типа груза из shared\cargo /CargoBase.js

class DangerCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor() {
    super('Danger', 3000, 'Вы взорвали груз'); //type, reward, reason
    this.destroyInProgress = false; //для проверки началась ли обработка урона (что бы не было случаев что урон несколько раз обработался за 0,5 секунды и программа будент пытаться несколько раз удалить автомобиль)
  }
  onDamage(vehicle, attacker, deliveryJob) {
    var _this = this;
    return _asyncToGenerator(function* () {
      if (!vehicle.valid) return false; // урон не обработан
      if (_this.destroyInProgresse) return true; // урон обработан

      alt_server__WEBPACK_IMPORTED_MODULE_0__.log("DangerCargo \u0430\u0432\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E \u0443\u0440\u043E\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A");
      _this.destroyInProgress = true;
      try {
        alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(attacker, 'explode');
        yield new Promise(resolve => alt_server__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolve, 500));
        vehicle.destroy();
        deliveryJob.fail(attacker);
      } finally {
        //в конце поставится this.destroyInProgress = false; и можно будет снова обрабатывать урон при следующем заказе
        _this.destroyInProgress = false;
        alt_server__WEBPACK_IMPORTED_MODULE_0__.log('finally DangerCargo');
      }
      return true; // урон обработан
    })();
  }
}

/***/ }),

/***/ "./server/cargo/HardCargo.js":
/*!***********************************!*\
  !*** ./server/cargo/HardCargo.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HardCargo: () => (/* binding */ HardCargo)
/* harmony export */ });
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ "./server/cargo/CargoBase.js");
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
//для работы функицй alt.

//Берется базовая логика типа груза из shared\cargo /CargoBase.js

class HardCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor() {
    super('Hard', 2000, 'Вы уничтожили груз'); //type, reward, reason
    this.destroyInProgress = false; //для проверки началась ли обработка урона (что бы не было случаев что урон несколько раз обработался за 0,5 секунды и программа будент пытаться несколько раз удалить автомобиль)
  }
  onDamage(vehicle, attacker, deliveryJob) {
    var _this = this;
    return _asyncToGenerator(function* () {
      if (!vehicle.valid) return false; // урон не обработан
      if (_this.destroyInProgress) return true; // урон обработан

      alt_server__WEBPACK_IMPORTED_MODULE_0__.log("HardCargo \u0430\u0432\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E \u0443\u0440\u043E\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A");
      _this.destroyInProgress = true;
      try {
        yield new Promise(resolve => alt_server__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolve, 500));
        vehicle.destroy();
        deliveryJob.fail(attacker);
      } finally {
        //в конце поставится this.destroyInProgress = false; и можно будет снова обрабатывать урон при следующем заказе
        _this.destroyInProgress = false;
        alt_server__WEBPACK_IMPORTED_MODULE_0__.log('finally HardCargo');
      }
      return true; // урон обработан
    })();
  }
}

/***/ }),

/***/ "./server/cargo/IllegalCargo.js":
/*!**************************************!*\
  !*** ./server/cargo/IllegalCargo.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IllegalCargo: () => (/* binding */ IllegalCargo)
/* harmony export */ });
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ "./server/cargo/CargoBase.js");
//для работы функицй alt.
//в этом файле такие функции не используются но вдруг в будущем будет добавлена еще логика и возникнет необходимость в altv функционале

//Берется базовая логика типа груза из shared\cargo /CargoBase.js

class IllegalCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__["default"] {
  constructor() {
    super('Illegal', 1500, 'Вы находились слишком близко к полицейскому участку'); //type, reward, reason
  }
}

/***/ }),

/***/ "alt-server":
/*!*****************************!*\
  !*** external "alt-server" ***!
  \*****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt_server_bcde031e__;

/***/ }),

/***/ "alt:chat":
/*!***************************!*\
  !*** external "alt:chat" ***!
  \***************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt_chat_aea54472__;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire_require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire_require("path");

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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./server/startServer.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ "alt-server");
/* harmony import */ var alt_chat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! alt:chat */ "alt:chat");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var _cargo_CommonCargo_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cargo/CommonCargo.js */ "./server/cargo/CommonCargo.js");
/* harmony import */ var _cargo_DangerCargo_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./cargo/DangerCargo.js */ "./server/cargo/DangerCargo.js");
/* harmony import */ var _cargo_HardCargo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./cargo/HardCargo.js */ "./server/cargo/HardCargo.js");
/* harmony import */ var _cargo_IllegalCargo_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./cargo/IllegalCargo.js */ "./server/cargo/IllegalCargo.js");
/* harmony import */ var _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./cargo/Consts.js */ "./server/cargo/Consts.js");
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// alt:V built-in module that provides server-side API.

// Your chat resource module.

//для работы с файлами

//для работы с путями файлов

//добавление логики каждого типа груза из папки shared\cargo







//для работы с данными из конфига
class ConfigManager {
  constructor() {
    this.loadingPoints = [];
    this.unloadingPoints = [];
    this.policeStations = [];
    this.allowedVehicles = [];
    this.cargoTypes = [_cargo_CommonCargo_js__WEBPACK_IMPORTED_MODULE_4__.CommonCargo, _cargo_HardCargo_js__WEBPACK_IMPORTED_MODULE_6__.HardCargo, _cargo_DangerCargo_js__WEBPACK_IMPORTED_MODULE_5__.DangerCargo, _cargo_IllegalCargo_js__WEBPACK_IMPORTED_MODULE_7__.IllegalCargo];
    this.deliveryState = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState;
  }
  //получение данных из конфига
  loadConfig() {
    var _fullConfig$points, _fullConfig$points2, _fullConfig$transport;
    var configPath = path__WEBPACK_IMPORTED_MODULE_3__.join(process.cwd(), 'resources', 'delivery', 'config', 'config.json'); //путь до конфига
    var configData = fs__WEBPACK_IMPORTED_MODULE_2__.readFileSync(configPath, 'utf8');
    var fullConfig = JSON.parse(configData); //получение всех данных из конфига
    // Разделение конфига на отдельные части
    this.loadingPoints = ((_fullConfig$points = fullConfig.points) === null || _fullConfig$points === void 0 ? void 0 : _fullConfig$points.loading) || [];
    this.unloadingPoints = ((_fullConfig$points2 = fullConfig.points) === null || _fullConfig$points2 === void 0 ? void 0 : _fullConfig$points2.unloading) || [];
    this.policeStations = fullConfig.policeStations || [];
    this.allowedVehicles = ((_fullConfig$transport = fullConfig.transport) === null || _fullConfig$transport === void 0 ? void 0 : _fullConfig$transport.allowedVehicles) || [];
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("Config loaded: ".concat(this.loadingPoints.length, " loading, ").concat(this.unloadingPoints.length, " unloading points"));
  }
  getCargoTypes() {
    return this.cargoTypes;
  }
  //оптравляет данные из конфига на клиент
  sendConfigToPlayer(player) {
    if (this.loadingPoints.length > 0) {
      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initLoadingPoints', this.loadingPoints);
    }
    if (this.unloadingPoints.length > 0) {
      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initUnloadingPoints', this.unloadingPoints);
    }
    if (this.policeStations.length > 0) {
      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initPoliceStations', this.policeStations);
    }
    if (this.allowedVehicles.length > 0) {
      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initAllowedVehicles', this.allowedVehicles);
    }
    // отправляет deliveryState на клиент (берется из Consts.js)
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initDeliveryState', this.deliveryState);
  }
}

//общий, основной класс системы доставки
class DeliveryJobSystem {
  constructor() {
    this.configManager = new ConfigManager();
    this.activeOrders = new Map(); // хранит активные заказы по ID игроков
    this.init();
  }
  init() {
    //получение данных из конфига
    this.configManager.loadConfig();
    //отправляет конфиг игроку после входа
    alt_server__WEBPACK_IMPORTED_MODULE_0__.on('playerConnect', player => {
      this.configManager.sendConfigToPlayer(player);
      alt_chat__WEBPACK_IMPORTED_MODULE_1__.send(player, "{80eb34}Press {ff0000}T {80eb34}and type {ff0000}/randomload {80eb34}to start delivery.");
      player.spawn(-1271.63, -1430.71, 4.34);
    });
    //когда клиент загрузил автомобиль приходит ивент с клиента
    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:startLoading', (player, loadedVehId) => {
      this.startLoading(player, loadedVehId);
    });
    //если с клиента приходит информация что игрок завершил доставку успешно
    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:completeDelivery', player => {
      this.completeDelivery(player);
    });
    //если с клиента приходит информация что игрок провалил доставку 
    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:failDelivery', player => {
      this.failDelivery(player);
    });
    alt_server__WEBPACK_IMPORTED_MODULE_0__.on('vehicleDamage', (vehicle, attacker) => {
      alt_server__WEBPACK_IMPORTED_MODULE_0__.log("\u0430\u0432\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E \u0443\u0440\u043E\u043D \u043F\u0435\u0440\u0435\u0434 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430\u043C\u0438");
      this.handleVehicleDamage(vehicle, attacker);
    });

    //единственный способ начать доставку /randomload
    alt_chat__WEBPACK_IMPORTED_MODULE_1__.registerCmd("randomload", player => {
      this.startNewOrder(player);
    });
    alt_chat__WEBPACK_IMPORTED_MODULE_1__.registerCmd("cancelorder", player => {
      this.cancelOrder(player);
    });
  }
  startNewOrder(player) {
    // отменяем текущий заказ если есть
    if (this.activeOrders.has(player.id)) {
      this.cancelOrder(player);
    }
    var order = new DeliveryJob(player, this.configManager);
    this.activeOrders.set(player.id, order);
    order.start(); // делегирует логику конкретному заказу
  }
  startLoading(player, loadedVehId) {
    var order = this.activeOrders.get(player.id);
    if (order) {
      order.Loaded(loadedVehId); // делегирует логику конкретному заказу
    }
  }
  completeDelivery(player) {
    var order = this.activeOrders.get(player.id);
    if (order) {
      order.complete(); // делегирует логику конкретному заказу

      this.activeOrders.delete(player.id);
    }
  }
  failDelivery(player) {
    var order = this.activeOrders.get(player.id);
    if (order) {
      order.fail(); // делегирует логику конкретному заказу
    }
  }
  cancelOrder(player) {
    var order = this.activeOrders.get(player.id);
    if (order) {
      order.cancel(); // делегирует логику конкретному заказу
      this.activeOrders.delete(player.id);
    }
  }
  handleVehicleDamage(vehicle, attacker) {
    var _this = this;
    return _asyncToGenerator(function* () {
      if (!(vehicle !== null && vehicle !== void 0 && vehicle.valid) || !(attacker instanceof alt_server__WEBPACK_IMPORTED_MODULE_0__.Player) || !attacker.valid) return;
      var order = _this.activeOrders.get(attacker.id);
      if (order && order.loadedVehId === vehicle.id) {
        //проверка что урон был получеен машиной в которую погружен заказ
        alt_server__WEBPACK_IMPORTED_MODULE_0__.log("\u0430\u0432\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E \u0443\u0440\u043E\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A \u043D\u0430 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C");
        alt_server__WEBPACK_IMPORTED_MODULE_0__.log("order.loadedVehId: ".concat(order.loadedVehId));
        yield order.handleDamage(vehicle, attacker);
      }
    })();
  }
}

// Конкретный личный заказ доставки
class DeliveryJob {
  constructor(player, configManager) {
    this.player = player; //id игрока которой выполняет доставку
    this.configManager = configManager;
    this.cargo = null; // текущий тип заказа
    this.loadedVehId = null; //id загруженнного автомобился
    this.cargoTypes = this.configManager.getCargoTypes(); // Получаем типы грузов из configManager
    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState.EMPTY; // empty, loading, delivering, completed, cancelled
    this.damageHandlingInProgress = false; // для единоразовой обработки урона
  }
  start() {
    var CargoClass = this.cargoTypes[Math.floor(Math.random() * this.cargoTypes.length)];
    this.cargo = new CargoClass();
    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState.ACTIVE; //показывает что заказ только что начался

    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("\u0412\u044B\u0431\u0440\u0430\u043D \u0442\u0438\u043F \u0433\u0440\u0443\u0437\u0430: ".concat(this.cargo.type));
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(this.player, 'client:startDelivery', this.cargo.type);
  }

  //запоминает loadedVehId
  Loaded(loadedVehId) {
    this.loadedVehId = loadedVehId;
    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState.DELIVERING; //автомобиль был загружен и едет до точки разгрузки, для проверок урона
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("Loaded vehicle: ".concat(loadedVehId));
  }

  // выдает награду
  complete() {
    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState.COMPLETED; // пока что не используется, но для дебага и для возможных расширений в коде
    this.cargo.onSuccessfulDelivery(this.player); // выдает награду
    this.loadedVehId = null;
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("Delivery completed for ".concat(this.player.id));
  }

  // отменяет текущий заказ
  cancel() {
    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState.CANCELLED; // пока что не используется, но для дебага и для возможных расширений в коде
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(this.player, 'client:cancelDelivery');
    this.loadedVehId = null;
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("Delivery cancelled for ".concat(this.player.id));
  }

  // отменяет текущий заказ + отправляет уведомление с причиной провала
  fail() {
    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState.FAILED; // пока что не используется, но для дебага и для возможных расширений в коде
    this.cargo.onDeliveryFailed(this.player);
    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(this.player, 'client:cancelDelivery');
    this.loadedVehId = null;
    alt_server__WEBPACK_IMPORTED_MODULE_0__.log("Delivery failed for ".concat(this.player.id));
  }
  handleDamage(vehicle, attacker) {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      //если авто получило урон, но игрок не едет к точке разгрузки или если урон уже обрабатывается (по идее проверка на state не нужна так как раньше была проверка на loadedVehId)
      if (_this2.state !== _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_8__.DeliveryState.DELIVERING || _this2.damageHandlingInProgress) return;
      _this2.damageHandlingInProgress = true; // что быв повтоно не вызывались проверки если авто еще н6е успело удалиться

      try {
        yield _this2.cargo.onDamage(vehicle, attacker, _this2);
      } finally {
        // после завершения обработки урона ставит this.damageHandlingInProgress = false;
        _this2.damageHandlingInProgress = false;
      }
    })();
  }
}

//new DeliveryJob();
new DeliveryJobSystem();
})();

