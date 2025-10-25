/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
import * as __WEBPACK_EXTERNAL_MODULE_alt__ from "alt";
import * as __WEBPACK_EXTERNAL_MODULE_node_fs_75ed2103__ from "node:fs";
import * as __WEBPACK_EXTERNAL_MODULE_node_path_02319fef__ from "node:path";
/******/ var __webpack_modules__ = ({

/***/ "./server/cargo/CargoBase.js":
/*!***********************************!*\
  !*** ./server/cargo/CargoBase.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ \"alt-server\");\n//для работы функицй alt.\n\nclass CargoBase {\n  constructor(type, reward, reason) {\n    this.type = type;\n    this.reward = reward;\n    this.reason = reason;\n  }\n  async onDamage(vehicle, attacker, deliveryJob) {\n    // базовая логика - без обработки урона\n\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`CargoBase авто получило урон после проверок`);\n    return false; //урон не обработан\n  }\n  //общая логика для успешного завершения\n  onSuccessfulDelivery(player) {\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'drawNotification', `+${this.reward}\\$`);\n  }\n  //общая логика для провала\n  onDeliveryFailed(player) {\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'drawNotification', `${this.reason}`);\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'drawNotification', 'заказ отменен!');\n  }\n}\n//передается CargoBase для файлов которые будут использовать import CargoBase from './CargoBase.js'\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (CargoBase); // default export\n\n//# sourceURL=webpack://altv-delivery-mod/./server/cargo/CargoBase.js?\n}");

/***/ }),

/***/ "./server/cargo/CommonCargo.js":
/*!*************************************!*\
  !*** ./server/cargo/CommonCargo.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   CommonCargo: () => (/* binding */ CommonCargo)\n/* harmony export */ });\n/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ \"alt-server\");\n/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ \"./server/cargo/CargoBase.js\");\n//для работы функицй alt.\n//в этом файле такие функции не используются но вдруг в будущем будет добавлена еще логика и возникнет необходимость в altv функционале\n\n//Берется базовая логика типа груза из shared\\cargo /CargoBase.js\n\nclass CommonCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"] {\n  constructor() {\n    super('Common', 1000, null); //type, reward, reason\n  }\n}\n\n//# sourceURL=webpack://altv-delivery-mod/./server/cargo/CommonCargo.js?\n}");

/***/ }),

/***/ "./server/cargo/Consts.js":
/*!********************************!*\
  !*** ./server/cargo/Consts.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DeliveryState: () => (/* binding */ DeliveryState)\n/* harmony export */ });\nconst DeliveryState = {\n  EMPTY: 'empty',\n  //'empty'\t\t\tнет активного заказа (провален или выполнен)\n  SELECTING_POINTS: 'selecting_points',\n  ///'selecting_points'\tизначальное состояние при старте системы на клиенте\n  WAITING_FOR_LOADING: 'waiting_for_loading',\n  //'waiting_for_loading'\tпосле старта доставки (когда активна точка погрузки)\n  DELIVERING: 'delivering',\n  //'delivering'\t\tс момента погрузки до момента разгрузки (активна точка разгрузки)\n  ACTIVE: 'active',\n  //используется только на сервере, показывает что заказ только что начался\n  COMPLETED: 'completed',\n  // используется только на сервере без функционала (нужно для деабага)\n  CANCELLED: 'cancelled',\n  // используется только на сервере без функционала (нужно для деабага)\n  FAILED: 'failed' // используется только на сервере без функционала (нужно для деабага)\n};\n\n//# sourceURL=webpack://altv-delivery-mod/./server/cargo/Consts.js?\n}");

/***/ }),

/***/ "./server/cargo/DangerCargo.js":
/*!*************************************!*\
  !*** ./server/cargo/DangerCargo.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DangerCargo: () => (/* binding */ DangerCargo)\n/* harmony export */ });\n/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ \"alt-server\");\n/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ \"./server/cargo/CargoBase.js\");\n//для работы функицй alt.\n\n//Берется базовая логика типа груза из shared\\cargo /CargoBase.js\n\nclass DangerCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"] {\n  constructor() {\n    super('Danger', 3000, 'Вы взорвали груз'); //type, reward, reason\n    this.destroyInProgress = false; //для проверки началась ли обработка урона (что бы не было случаев что урон несколько раз обработался за 0,5 секунды и программа будент пытаться несколько раз удалить автомобиль)\n  }\n  async onDamage(vehicle, attacker, deliveryJob) {\n    if (!vehicle.valid) return false; // урон не обработан\n    if (this.destroyInProgresse) return true; // урон обработан\n\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`DangerCargo авто получило урон после проверок`);\n    this.destroyInProgress = true;\n    try {\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(attacker, 'explode');\n      await new Promise(resolve => alt_server__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolve, 500));\n      vehicle.destroy();\n      deliveryJob.fail(attacker);\n    } finally {\n      //в конце поставится this.destroyInProgress = false; и можно будет снова обрабатывать урон при следующем заказе\n      this.destroyInProgress = false;\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.log('finally DangerCargo');\n    }\n    return true; // урон обработан\n  }\n}\n\n//# sourceURL=webpack://altv-delivery-mod/./server/cargo/DangerCargo.js?\n}");

/***/ }),

/***/ "./server/cargo/HardCargo.js":
/*!***********************************!*\
  !*** ./server/cargo/HardCargo.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   HardCargo: () => (/* binding */ HardCargo)\n/* harmony export */ });\n/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ \"alt-server\");\n/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ \"./server/cargo/CargoBase.js\");\n//для работы функицй alt.\n\n//Берется базовая логика типа груза из shared\\cargo /CargoBase.js\n\nclass HardCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"] {\n  constructor() {\n    super('Hard', 2000, 'Вы уничтожили груз'); //type, reward, reason\n    this.destroyInProgress = false; //для проверки началась ли обработка урона (что бы не было случаев что урон несколько раз обработался за 0,5 секунды и программа будент пытаться несколько раз удалить автомобиль)\n  }\n  async onDamage(vehicle, attacker, deliveryJob) {\n    if (!vehicle.valid) return false; // урон не обработан\n    if (this.destroyInProgress) return true; // урон обработан\n\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`HardCargo авто получило урон после проверок`);\n    this.destroyInProgress = true;\n    try {\n      await new Promise(resolve => alt_server__WEBPACK_IMPORTED_MODULE_0__.setTimeout(resolve, 500));\n      vehicle.destroy();\n      deliveryJob.fail(attacker);\n    } finally {\n      //в конце поставится this.destroyInProgress = false; и можно будет снова обрабатывать урон при следующем заказе\n      this.destroyInProgress = false;\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.log('finally HardCargo');\n    }\n    return true; // урон обработан\n  }\n}\n\n//# sourceURL=webpack://altv-delivery-mod/./server/cargo/HardCargo.js?\n}");

/***/ }),

/***/ "./server/cargo/IllegalCargo.js":
/*!**************************************!*\
  !*** ./server/cargo/IllegalCargo.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   IllegalCargo: () => (/* binding */ IllegalCargo)\n/* harmony export */ });\n/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ \"alt-server\");\n/* harmony import */ var _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CargoBase.js */ \"./server/cargo/CargoBase.js\");\n//для работы функицй alt.\n//в этом файле такие функции не используются но вдруг в будущем будет добавлена еще логика и возникнет необходимость в altv функционале\n\n//Берется базовая логика типа груза из shared\\cargo /CargoBase.js\n\nclass IllegalCargo extends _CargoBase_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"] {\n  constructor() {\n    super('Illegal', 1500, 'Вы находились слишком близко к полицейскому участку'); //type, reward, reason\n  }\n}\n\n//# sourceURL=webpack://altv-delivery-mod/./server/cargo/IllegalCargo.js?\n}");

/***/ }),

/***/ "./server/startServer.js":
/*!*******************************!*\
  !*** ./server/startServer.js ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var alt_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! alt-server */ \"alt-server\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var _cargo_CommonCargo_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./cargo/CommonCargo.js */ \"./server/cargo/CommonCargo.js\");\n/* harmony import */ var _cargo_DangerCargo_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cargo/DangerCargo.js */ \"./server/cargo/DangerCargo.js\");\n/* harmony import */ var _cargo_HardCargo_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./cargo/HardCargo.js */ \"./server/cargo/HardCargo.js\");\n/* harmony import */ var _cargo_IllegalCargo_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./cargo/IllegalCargo.js */ \"./server/cargo/IllegalCargo.js\");\n/* harmony import */ var _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./cargo/Consts.js */ \"./server/cargo/Consts.js\");\n// alt:V built-in module that provides server-side API.\n\n// Your chat resource module.\n//import * as chat from 'alt:chat';\n//для работы с файлами\n\n//для работы с путями файлов\n\n//добавление логики каждого типа груза из папки shared\\cargo\n\n\n\n\n\n\n\n//для работы с данными из конфига\nclass ConfigManager {\n  constructor() {\n    this.loadingPoints = [];\n    this.unloadingPoints = [];\n    this.policeStations = [];\n    this.allowedVehicles = [];\n    this.cargoTypes = [_cargo_CommonCargo_js__WEBPACK_IMPORTED_MODULE_3__.CommonCargo, _cargo_HardCargo_js__WEBPACK_IMPORTED_MODULE_5__.HardCargo, _cargo_DangerCargo_js__WEBPACK_IMPORTED_MODULE_4__.DangerCargo, _cargo_IllegalCargo_js__WEBPACK_IMPORTED_MODULE_6__.IllegalCargo];\n    this.deliveryState = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState;\n  }\n  //получение данных из конфига\n  loadConfig() {\n    try {\n      var _fullConfig$points, _fullConfig$points2, _fullConfig$transport;\n      // Используем правильный путь для alt:V ресурсов\n      const configPath = path__WEBPACK_IMPORTED_MODULE_2__.join(process.cwd(), 'resources', 'delivery', 'config', 'config.json');\n\n      // Проверяем существование файла\n      if (!fs__WEBPACK_IMPORTED_MODULE_1__.existsSync(configPath)) {\n        alt_server__WEBPACK_IMPORTED_MODULE_0__.logError(`Config file not found: ${configPath}`);\n        return;\n      }\n      const configData = fs__WEBPACK_IMPORTED_MODULE_1__.readFileSync(configPath, 'utf8');\n      const fullConfig = JSON.parse(configData); //получение всех данных из конфига\n      // Разделение конфига на отдельные части\n      this.loadingPoints = ((_fullConfig$points = fullConfig.points) === null || _fullConfig$points === void 0 ? void 0 : _fullConfig$points.loading) || [];\n      this.unloadingPoints = ((_fullConfig$points2 = fullConfig.points) === null || _fullConfig$points2 === void 0 ? void 0 : _fullConfig$points2.unloading) || [];\n      this.policeStations = fullConfig.policeStations || [];\n      this.allowedVehicles = ((_fullConfig$transport = fullConfig.transport) === null || _fullConfig$transport === void 0 ? void 0 : _fullConfig$transport.allowedVehicles) || [];\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`Config loaded: ${this.loadingPoints.length} loading, ${this.unloadingPoints.length} unloading points`);\n    } catch (error) {\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.logError(`Error loading config: ${error.message}`);\n    }\n  }\n  getCargoTypes() {\n    return this.cargoTypes;\n  }\n  //оптравляет данные из конфига на клиент\n  sendConfigToPlayer(player) {\n    if (this.loadingPoints.length > 0) {\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initLoadingPoints', this.loadingPoints);\n    }\n    if (this.unloadingPoints.length > 0) {\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initUnloadingPoints', this.unloadingPoints);\n    }\n    if (this.policeStations.length > 0) {\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initPoliceStations', this.policeStations);\n    }\n    if (this.allowedVehicles.length > 0) {\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initAllowedVehicles', this.allowedVehicles);\n    }\n    // отправляет deliveryState на клиент (берется из Consts.js)\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(player, 'initDeliveryState', this.deliveryState);\n  }\n}\n\n//общий, основной класс системы доставки\nclass DeliveryJobSystem {\n  constructor() {\n    this.configManager = new ConfigManager();\n    this.activeOrders = new Map(); // хранит активные заказы по ID игроков\n    this.init();\n  }\n  init() {\n    //получение данных из конфига\n    this.configManager.loadConfig();\n    //отправляет конфиг игроку после входа\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.on('playerConnect', player => {\n      this.configManager.sendConfigToPlayer(player);\n      // chat.send(player, \"{80eb34}Press {ff0000}T {80eb34}and type {ff0000}/randomload {80eb34}to start delivery.\");\n    });\n    //когда клиент загрузил автомобиль приходит ивент с клиента\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:startLoading', (player, loadedVehId) => {\n      this.startLoading(player, loadedVehId);\n    });\n    //если с клиента приходит информация что игрок завершил доставку успешно\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:completeDelivery', player => {\n      this.completeDelivery(player);\n    });\n    //если с клиента приходит информация что игрок провалил доставку \n    alt_server__WEBPACK_IMPORTED_MODULE_0__.onClient('client:failDelivery', player => {\n      this.failDelivery(player);\n    });\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.on('vehicleDamage', (vehicle, attacker) => {\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`авто получило урон перед проверками`);\n      this.handleVehicleDamage(vehicle, attacker);\n    });\n    /*\r\n            //единственный способ начать доставку /randomload\r\n            chat.registerCmd(\"randomload\", (player) => {\r\n                this.startNewOrder(player);\r\n            });\r\n    \r\n            chat.registerCmd(\"cancelorder\", (player) => {\r\n                this.cancelOrder(player);\r\n            });\r\n            */\n  }\n  startNewOrder(player) {\n    // отменяем текущий заказ если есть\n    if (this.activeOrders.has(player.id)) {\n      this.cancelOrder(player);\n    }\n    const order = new DeliveryJob(player, this.configManager);\n    this.activeOrders.set(player.id, order);\n    order.start(); // делегирует логику конкретному заказу\n  }\n  startLoading(player, loadedVehId) {\n    const order = this.activeOrders.get(player.id);\n    if (order) {\n      order.Loaded(loadedVehId); // делегирует логику конкретному заказу\n    }\n  }\n  completeDelivery(player) {\n    const order = this.activeOrders.get(player.id);\n    if (order) {\n      order.complete(); // делегирует логику конкретному заказу\n\n      this.activeOrders.delete(player.id);\n    }\n  }\n  failDelivery(player) {\n    const order = this.activeOrders.get(player.id);\n    if (order) {\n      order.fail(); // делегирует логику конкретному заказу\n    }\n  }\n  cancelOrder(player) {\n    const order = this.activeOrders.get(player.id);\n    if (order) {\n      order.cancel(); // делегирует логику конкретному заказу\n      this.activeOrders.delete(player.id);\n    }\n  }\n  async handleVehicleDamage(vehicle, attacker) {\n    if (!(vehicle !== null && vehicle !== void 0 && vehicle.valid) || !(attacker instanceof alt_server__WEBPACK_IMPORTED_MODULE_0__.Player) || !attacker.valid) return;\n    const order = this.activeOrders.get(attacker.id);\n    if (order && order.loadedVehId === vehicle.id) {\n      //проверка что урон был получеен машиной в которую погружен заказ\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`авто получило урон после проверок на загруженный автомобиль`);\n      alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`order.loadedVehId: ${order.loadedVehId}`);\n      await order.handleDamage(vehicle, attacker);\n    }\n  }\n}\n\n// Конкретный личный заказ доставки\nclass DeliveryJob {\n  constructor(player, configManager) {\n    this.player = player; //id игрока которой выполняет доставку\n    this.configManager = configManager;\n    this.cargo = null; // текущий тип заказа\n    this.loadedVehId = null; //id загруженнного автомобился\n    this.cargoTypes = this.configManager.getCargoTypes(); // Получаем типы грузов из configManager\n    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState.EMPTY; // empty, loading, delivering, completed, cancelled\n    this.damageHandlingInProgress = false; // для единоразовой обработки урона\n  }\n  start() {\n    const CargoClass = this.cargoTypes[Math.floor(Math.random() * this.cargoTypes.length)];\n    this.cargo = new CargoClass();\n    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState.ACTIVE; //показывает что заказ только что начался\n\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`Выбран тип груза: ${this.cargo.type}`);\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(this.player, 'client:startDelivery', this.cargo.type);\n  }\n\n  //запоминает loadedVehId\n  Loaded(loadedVehId) {\n    this.loadedVehId = loadedVehId;\n    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState.DELIVERING; //автомобиль был загружен и едет до точки разгрузки, для проверок урона\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`Loaded vehicle: ${loadedVehId}`);\n  }\n\n  // выдает награду\n  complete() {\n    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState.COMPLETED; // пока что не используется, но для дебага и для возможных расширений в коде\n    this.cargo.onSuccessfulDelivery(this.player); // выдает награду\n    this.loadedVehId = null;\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`Delivery completed for ${this.player.id}`);\n  }\n\n  // отменяет текущий заказ\n  cancel() {\n    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState.CANCELLED; // пока что не используется, но для дебага и для возможных расширений в коде\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(this.player, 'client:cancelDelivery');\n    this.loadedVehId = null;\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`Delivery cancelled for ${this.player.id}`);\n  }\n\n  // отменяет текущий заказ + отправляет уведомление с причиной провала\n  fail() {\n    this.state = _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState.FAILED; // пока что не используется, но для дебага и для возможных расширений в коде\n    this.cargo.onDeliveryFailed(this.player);\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.emitClient(this.player, 'client:cancelDelivery');\n    this.loadedVehId = null;\n    alt_server__WEBPACK_IMPORTED_MODULE_0__.log(`Delivery failed for ${this.player.id}`);\n  }\n  async handleDamage(vehicle, attacker) {\n    //если авто получило урон, но игрок не едет к точке разгрузки или если урон уже обрабатывается (по идее проверка на state не нужна так как раньше была проверка на loadedVehId)\n    if (this.state !== _cargo_Consts_js__WEBPACK_IMPORTED_MODULE_7__.DeliveryState.DELIVERING || this.damageHandlingInProgress) return;\n    this.damageHandlingInProgress = true; // что быв повтоно не вызывались проверки если авто еще н6е успело удалиться\n\n    try {\n      await this.cargo.onDamage(vehicle, attacker, this);\n    } finally {\n      // после завершения обработки урона ставит this.damageHandlingInProgress = false;\n      this.damageHandlingInProgress = false;\n    }\n  }\n}\n\n//new DeliveryJob();\nnew DeliveryJobSystem();\n\n//# sourceURL=webpack://altv-delivery-mod/./server/startServer.js?\n}");

/***/ }),

/***/ "alt-server":
/*!**********************!*\
  !*** external "alt" ***!
  \**********************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_alt__;

/***/ }),

/***/ "fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_node_fs_75ed2103__;

/***/ }),

/***/ "path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_node_path_02319fef__;

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
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module can't be inlined because the eval devtool is used.
/******/ var __webpack_exports__ = __webpack_require__("./server/startServer.js");
/******/ 
