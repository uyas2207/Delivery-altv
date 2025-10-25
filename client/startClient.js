import * as alt from 'alt-client';
import * as native from "natives";

// Функция для уведомлений GTA
function drawNotification(message, autoHide = false) {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(message);
    const notificationId = native.endTextCommandThefeedPostTicker(false, false);
    
    if (autoHide) {
        setTimeout(() => {
            native.thefeedRemoveItem(notificationId);
        }, 3000);
    }
}

// Обработчик серверных уведомлений
alt.onServer('drawNotification', drawNotification);

// Менеджер уведомлений через WebView
class NotificationManager {
    static instance = null;
    
    static getInstance() {
        if (!this.instance) {
            alt.log('instance создан в первый раз:');
            this.instance = new NotificationManager();
        }
        alt.log('Передан instance:');
        return this.instance;
    }

    constructor() {
        if (NotificationManager.instance) {
            alt.log('Повторный вызов constructor NotificationManager');
            return NotificationManager.instance;
        }
        
        this.webView = null;
        this.isInitialized = false;
        this.isWebViewOpen = false;
        NotificationManager.instance = this;
    }
    
    async initialize() {
        if (this.isInitialized) {
            alt.log('NotificationManager уже инициализирован');
            return;
        }
        await this.init();
    }

    async init() {
        this.webView = new alt.WebView('http://resource/client/html/index.html');

        const loadPromise = new Promise((resolve) => {
            this.webView.once('load', () => resolve(true));
        });
        
        const timeoutPromise = new Promise((resolve) => {
            alt.setTimeout(() => resolve(false), 2000);
        });
        
        const isLoaded = await Promise.race([loadPromise, timeoutPromise]);
        
        if (isLoaded) {
            this.isInitialized = true;
            alt.log('Notification manager initialized SUCCESS');
        } else {
            alt.log('Notification manager did not initialize FAILURE (timeout)');
        }
    }

    showPersistent(title, text, id = null) {
        if (!this.isInitialized) {
            alt.log('Notification manager не инициализирован');
            return null;
        }
        
        const notificationId = id || `persistent_${Date.now()}`;
        this.webView.emit('showPersistentNotification', notificationId, title, text);
        this.isWebViewOpen = true;
        return notificationId;
    }
    
    hidePersistent(id) {
        if (this.isInitialized) {
            this.webView.emit('hidePersistentNotification', id);
            this.isWebViewOpen = false;
        } else {
            alt.log('Попытка скрыть Notification при isInitialized === null');
            this.isWebViewOpen = false;
        }
    }
}

// Блокировщик транспорта
class VehicleBlocker {
    async blockVehicleForThreeSeconds(vehicle) {
        return new Promise((resolve) => {    
            if (vehicle && vehicle.valid) {
                vehicle.frozen = true;
                setTimeout(() => {
                    vehicle.frozen = false;
                    resolve();
                }, 3000);
            } else {
                resolve();
                alt.log('Ошибка, неправильный resolve')
            }
        });
    }
}

// Визуальные элементы точки
class PointVisuals {
    constructor(pointConfig) {
        this.pointConfig = pointConfig;
        this.position = new alt.Vector3(pointConfig.x, pointConfig.y, pointConfig.z);
        this.marker = null;
        this.blip = null;
        this.colshape = null;
    }

    create() {
        if (this.pointConfig.colshapeRadius === undefined){
            this.pointConfig.colshapeRadius = 350;
        }
        
        if (this.pointConfig.markerType !== undefined) {
            this.marker = new alt.Marker(this.pointConfig.markerType, this.position, new alt.RGBA(
                this.pointConfig.markerColor[0], 
                this.pointConfig.markerColor[1], 
                this.pointConfig.markerColor[2], 
                this.pointConfig.markerColor[3]
            ));
        }

        this.blip = new alt.PointBlip(this.position.x, this.position.y, this.position.z);
        this.blip.sprite = this.pointConfig.blipSprite;
        this.blip.color = this.pointConfig.blipColor;
        this.blip.name = this.pointConfig.name;
        this.blip.shortRange = this.pointConfig.blipshortRange;

        this.colshape = new alt.ColshapeSphere(
            this.position.x, 
            this.position.y, 
            this.position.z,
            this.pointConfig.colshapeRadius
        );

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

    async initializeNotificationManager() {
        alt.log('1. Инициализация NotificationManager');
        const notificationManager = NotificationManager.getInstance();
        await notificationManager.initialize();
        alt.log('1. NotificationManager инициализирован через DeliveryJobClient');
    }

    init() { 
        alt.log('2. Инициализация системы доставки.');
        
        alt.onServer('initLoadingPoints', (points) => {
            this.config.loadingPoints = points;
        });
        
        alt.onServer('initUnloadingPoints', (points) => {
            this.config.unloadingPoints = points;
        });
        
        alt.onServer('initPoliceStations', (points) => {
            this.config.policeStations = points;
            this.createPoliceBlipsColshapes();
        });
        
        alt.onServer('initAllowedVehicles', (VehHash) => {
            this.config.allowedVehicles = VehHash;
        });
        
        alt.onServer('initDeliveryState', (deliveryState) => {
            this.DeliveryState = deliveryState;
            this.state = this.DeliveryState.SELECTING_POINTS;
            alt.log('DeliveryState получен и установлен');
        });
        
        alt.onServer('client:startDelivery', (cargoType) => {
            this.startNewOrder(cargoType);
            alt.log(`cargoType ${cargoType}`);
        });
        
        alt.onServer('client:cancelDelivery', () => {
            this.cancelCurrentOrder();
        });
        
        alt.onServer('client:destroyDeliveryJob',() => {
            this.destroy();
        });
        
        alt.onServer("explode",() =>{
            const player = alt.Player.local;
            if (player.vehicle) {
                native.addExplosion(
                    player.vehicle.pos.x,
                    player.vehicle.pos.y,
                    player.vehicle.pos.z,
                    9,
                    5.0,
                    true,
                    false,
                    0.0,
                    true
                );
            }
        });
        
        alt.on('entityEnterColshape', this.handleEnterColshapeDeliveryJobClient.bind(this));
        alt.on('entityLeaveColshape', this.handleLeaveColshapeDeliveryJobClient.bind(this));
    }
    
    createPoliceBlipsColshapes() {
        this.config.policeStations.forEach((station, index) => {
            const policeVisuals = new PointVisuals(station).create();
            policeVisuals.colshape.isPoliceZone = true;
            policeVisuals.colshape.policeStationId = index;
            this.policeColshapes.push(policeVisuals.colshape);
        });
        alt.log(`Создано ${this.config.policeStations.length} полицейских участков`);
    }
    
    startNewOrder(cargoType) {
        if (this.currentOrder) {
            this.cancelCurrentOrder();
        }
        this.currentOrder = new DeliveryOrder(
            cargoType,
            this.config,
            this.policeColshapes,
            this.DeliveryState
        );
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
        const player = alt.Player.local;
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;
        }
        if (this.currentOrder !== null) {
            alt.log(`Вошел в колшейп`);
            this.currentOrder.handleColshapeEnterDeliveryOrder(colshape);
        }
    }
    
    handleLeaveColshapeDeliveryJobClient(colshape, entity) {
        if (NotificationManager.getInstance().isWebViewOpen){
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
        this.pointBaseType = {LOADING: 'loading', UNLOADING: 'unloading'};
    }

    async start() {
        await this.selectPoints();
        this.createLoadingPoint();
        this.state = this.DeliveryState.WAITING_FOR_LOADING;
    }

    selectPoints() {
        return new Promise((resolve) => {
            this.loadingPoint = this.config.loadingPoints[Math.floor(Math.random() * this.config.loadingPoints.length)];
            this.unloadingPoint = this.config.unloadingPoints[Math.floor(Math.random() * this.config.unloadingPoints.length)];
            
            if (this.cargoType === 'Illegal') {
                this.distanceFromPoliceStations();
            }
            resolve();
        });
    }
    
    async distanceFromPoliceStations() {
        const minDistance = 350;
        const unloadingPos = new alt.Vector3(this.unloadingPoint.x, this.unloadingPoint.y, this.unloadingPoint.z);
        
        let isTooClose = this.config.policeStations.some(station => {
            const stationPos = new alt.Vector3(station.x, station.y, station.z);
            const distance = unloadingPos.distanceTo(stationPos);
            alt.log(`Расстояние до полицейского участка ${station.name}: ${distance}`);
            return (distance < minDistance);
        });
        
        if (isTooClose) {
            alt.log(`Точка разгрузки слишком близко к полиции, выбираентся новая...`);
            this.unloadingPoint = this.config.unloadingPoints[Math.floor(Math.random() * this.config.unloadingPoints.length)];
            this.distanceFromPoliceStations();
            await new Promise(resolve => alt.setTimeout(resolve, 10));
        }
    }

    createLoadingPoint() {
        const pointVisuals = new PointVisuals(this.loadingPoint).create();
        this.loadingPoint = new PointBase(this.pointBaseType.LOADING, this, pointVisuals);
    }

    createUnloadingPoint() {
        const pointVisuals = new PointVisuals(this.unloadingPoint).create();
        this.unloadingPoint = new PointBase(this.pointBaseType.UNLOADING, this, pointVisuals);
    }

    handleColshapeEnterDeliveryOrder(colshape) {
        alt.log(`alt.Player.local.vehicle.id: ${alt.Player.local.vehicle.id}`)
        
        if (!this.loadingPoint || !this.unloadingPoint || !this.policeColshapes) return;
        
        if (this.state === this.DeliveryState.WAITING_FOR_LOADING) {
            if (colshape === this.loadingPoint.pointVisuals.colshape){
                this.loadingPoint.PointLoad(colshape, alt.Player.local.vehicle);
            }
        } 
        
        if (this.state === this.DeliveryState.DELIVERING) {
            if (colshape === this.unloadingPoint.pointVisuals.colshape){
                this.unloadingPoint.PointUnload(colshape, alt.Player.local.vehicle);
           }
        }
        
        if(colshape.isPoliceZone){
            if ((this.cargoType === 'Illegal') && (alt.Player.local.vehicle.id === this.loadedVehId)){
                alt.emitServer('client:failDelivery');
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
    
    async executeLoading(vehicle) {
        const vehicleBlocker = new VehicleBlocker();
        drawNotification('Начало погрузки...', true);
        await vehicleBlocker.blockVehicleForThreeSeconds(vehicle);

        this.loadedVehId = vehicle.id;
        this.loadingPoint.pointVisuals.destroy();
        this.createUnloadingPoint();
        this.state = this.DeliveryState.DELIVERING;
        
        drawNotification(`Погрузка завершена! Груз: ${this.cargoType}`);
        alt.emitServer('client:startLoading', this.loadedVehId);
    }
    
    async executeUnloading(vehicle) {
        const vehicleBlocker = new VehicleBlocker();
        drawNotification('Начало разгрузки...', true);
        await vehicleBlocker.blockVehicleForThreeSeconds(vehicle);

        this.loadedVehId = null;
        this.unloadingPoint.pointVisuals.destroy();
        this.state = this.DeliveryState.EMPTY;
        
        alt.emitServer('client:completeDelivery');
        drawNotification(`Доставка завершена! Груз: ${this.cargoType}`);
        this.deliveryJobClient.currentOrder = null;
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
        alt.log (`PointLoad`)
        const player = alt.Player.local;
        
        if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) {
            drawNotification('Транспорт не подходит для перевозки');
            return;
        }

        NotificationManager.getInstance().showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");
        
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик 1')
        }

        this.keyPressHandler = (key) => { 
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen) && (this.pointVisuals.position.distanceTo(player.pos) < 10)) {
                this.cleanup();
                NotificationManager.getInstance().hidePersistent();
                if (!player.vehicle) {
                    drawNotification('Вы не находитесь в транспорте');
                    return;
                }
                if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) {
                    alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                    drawNotification('Неправильное авто');
                    return;
                }
                alt.log('Началась погрузка');
                this.deliveryOrder.executeLoading(player.vehicle);
            }   
        };

        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик погрузки')
    }

    PointUnload(colshape, entity) {
        const player = alt.Player.local;

        if (this.deliveryOrder.loadedVehId !== player.vehicle.id) {
            drawNotification('Это не тот транспорт, в который был загружен груз');
            return;
        }

        NotificationManager.getInstance().showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");

        this.keyPressHandler = (key) => {
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen) && (this.pointVisuals.position.distanceTo(player.pos) < 15)) {
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
                alt.log('Началась разгрузка');
                this.deliveryOrder.executeUnloading(player.vehicle);
            }   
        };

        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик разгрузки')
    }

    cleanup() {
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик')
            this.keyPressHandler = null;
        }
    }
}

// Запуск системы
new DeliveryJobClient();
alt.log('=== Cargo Delivery Client Module Loaded ===');