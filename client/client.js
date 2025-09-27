import * as alt from 'alt-client';
import * as native from "natives";

function drawNotification(message, autoHide = false) {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(message);
    const notificationId = native.endTextCommandThefeedPostTicker(false, false);
    
    if (autoHide !== false) {
        setTimeout(() => {
            native.thefeedRemoveItem(notificationId);
        }, 3000);
    }
}

alt.onServer('drawNotification', drawNotification);

class NotificationManager {
    constructor() {
        this.webView = null;
        this.isInitialized = false;
        this.isWebViewOpen = false;
        this.init();
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
            
            if (isLoaded === true) {
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
        }
        this.isWebViewOpen = false;
    }
}

const notificationManager = new NotificationManager();

// Блокировщик транспорта
class VehicleBlocker {
    blockVehicle(vehicle) {
        if (vehicle && vehicle.valid) {
            vehicle.frozen = true;
        }
    }

    unblockVehicle(vehicle) {
        if (vehicle && vehicle.valid) {
            vehicle.frozen = false;
        }
    }
}

// Общая система управления доставкой создается при подключении игрока
class DeliveryJobClient {
    constructor() {
        this.unloadingPoints = [];
        this.loadingPoints = [];
        this.allowedVehicles = [];
        this.policeStations = [];

        this.state = 'selecting_points';
        this.currentOrder = null;                       // В будущем класс для конкретного заказа, пока что null что бы не использовать что либо что относится только к конкретному заказау до того как игрок начнет конкретный заказ

        this.vehicleBlocker = new VehicleBlocker();
        this.init();
    }

        init() { 
            alt.onServer('initLoadingPoints', (points) => {
                this.loadingPoints = points;
              //  this.selectRandomLoadingPoint();
            });
            
            alt.onServer('initUnloadingPoints', (points) => {
                this.unloadingPoints = points;
            });
            
            alt.onServer('initPoliceStations', (points) => {
                this.policeStations = points;
                this.createPoliceBlips();
            //    this.cargoBase.createPoliceColshapes(this.policeStations);
            });
            
            alt.onServer('initAllowedVehicles', (VehHash) => {
                this.allowedVehicles = VehHash;
            });
            
            alt.onServer('client:startDelivery', (cargoType) => {
                this.startNewOrder(cargoType);
                /*
                this.destroyAllPoints();
                this.loadedvehid = null;
                this.cargoBase.loadtype = null;
                this.selectRandomLoadingPoint();
                */
            });

        // Обработка входа/выхода из колшейпов
        alt.on('entityEnterColshape', this.handleEnterColshapeDeliveryJobClient.bind(this));
        alt.on('entityLeaveColshape', this.handleLeaveColshapeDeliveryJobClient.bind(this));

        }

        createPoliceBlips() {
                this.policeStations.forEach(station => {
                    const item = this.createBlip(station, station.blipSprite, station.blipColor);
                });
                alt.log(`Создано ${this.policeStations.length} полицейских участков`);
            }

        createBlip(point, sprite, color) {
            const blip = new alt.PointBlip(point.x, point.y, point.z);
            blip.sprite = sprite;
            blip.color = color;
            blip.name = point.name;
            blip.scale = point.blipscale;
            blip.shortRange = point.blipshortRange;
            return blip;
        }    
        
        startNewOrder(cargoType) {
            if (this.currentOrder) {
                this.cancelCurrentOrder();
            }
            // инициализируется класс конкретного заказа только при старте конкретного заказа
            this.currentOrder = new DeliveryOrder(
                //передаются все необходимые переменные для конкретного заказа
                cargoType,
                this.unloadingPoints,
                this.loadingPoints,
                this.allowedVehicles,
                this.policeStations,
                
                this.notificationSystem,
                this.vehicleBlocker
            );
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
                    entity = player.vehicle;
                }
        alt.log(`this.currentOrder: ${this.currentOrder}`);
        if ((this.currentOrder !== null)) {
            alt.log(`Вошел в колшейп`);
            this.currentOrder.handleColshapeEnterDeliveryOrder(colshape);
        }
    }

    handleLeaveColshapeDeliveryJobClient(colshape, entity) {
        alt.log(`Вышел из колшейпа`);
        if (notificationManager.isWebViewOpen !== false){
                notificationManager.hidePersistent();
            }
        if (this.currentOrder && entity === alt.Player.local.vehicle) {
            this.currentOrder.handleColshapeLeave(colshape);
        }
    }     

}

// Конкретный заказ на клиенте, создается только при старте доставки у конкретного игрока (не при входе на сервер)
class DeliveryOrder {
    constructor(cargoType, unloadingPoints, loadingPoints, allowedVehicles, policeStations, notificationSystem, vehicleBlocker) {
        this.cargoType = cargoType;
        this.unloadingPoints = unloadingPoints;
        this.loadingPoints = loadingPoints;
        this.allowedVehicles = allowedVehicles;
        this.policeStations = policeStations;
        this.notificationSystem = notificationSystem;
        this.vehicleBlocker = vehicleBlocker;
        
        this.loadingPoint = null;
        this.unloadingPoint = null;
    }

    async start() {
        await this.selectPoints();
        this.createLoadingPoint();
        this.state = 'waiting_for_loading';
        
    }

    selectPoints() {
        return new Promise((resolve) => {
            // Выбор случайных точек            
            this.loadingPoint = this.loadingPoints[Math.floor(Math.random() * this.loadingPoints.length)];
            this.unloadingPoint = this.unloadingPoints[Math.floor(Math.random() * this.unloadingPoints.length)];
            /*
            // Проверка для нелегального 
            if (this.cargoType === 'Illegal') {
                this.distanceFromPoliceStations();
            }
            */
            resolve();
        });
    }

    distanceFromPoliceStations() {
        const minDistance = 350;
        
        let isTooClose = this.policeStations.some(station => {
            const distance = this.unloadingPoint.distanceTo(station);
            return (distance < minDistance); //если distance меньше чем 350 isTooClose = true 
        });
        
        if (isTooClose === true) {
            // Перевыбираем точку разгрузки, не меняя точки погрузки
            this.unloadingPoint = this.unloadingPoints[Math.floor(Math.random() * this.unloadingPoints.length)];
            this.distanceFromPoliceStations(); // Рекурсивная проверка
        }
    }

    createLoadingPoint() {
        // Создаем визуальные элементы
        const pointVisuals = new PointVisuals(this.loadingPoint).create();
        
        // Создаем PointBase с поведением
        this.loadingPoint = new PointBase('loading', this, pointVisuals);
    }

    createUnloadingPoint() {
        const pointConfig = this.unloadingPoint;
        
        // Создаем визуальные элементы
        const pointVisuals = new PointVisuals(
            new alt.Vector3(pointConfig.x, pointConfig.y, pointConfig.z),
            pointConfig.colshapeRadius,
            pointConfig.markerType,
            pointConfig.blipSprite
        ).create();
        
        // Создаем PointBase с поведением
        this.unloadingPoint = new PointBase('unloading', this, pointVisuals);
    }

    handleColshapeEnterDeliveryOrder(colshape) {
        // если в будущем будет добавлено больше колшейпов
        if (!this.loadingPoint || !this.unloadingPoint) return;

        if (colshape === this.loadingPoint.pointVisuals.colshape && this.state === 'waiting_for_loading') {
            this.loadingPoint.PointLoad(colshape, alt.Player.local.vehicle);
        } else if (colshape === this.unloadingPoint.pointVisuals.colshape && this.state === 'delivering') {
            this.unloadingPoint.PointUnload(colshape, alt.Player.local.vehicle);
        }
    }

}

// Класс для создания и уничтожения визуальных элементов точки
class PointVisuals {
    constructor(pointConfig) {
        this.pointConfig = pointConfig;
        this.position = new alt.Vector3(pointConfig.x, pointConfig.y, pointConfig.z);

        this.marker = null;
        this.blip = null;
        this.colshape = null;
    }

    create() {
    // Создание маркера
    this.marker = new alt.Marker(
        this.pointConfig.markerType, // значение по умолчанию
        this.position, // используем уже созданный position
        new alt.RGBA(this.pointConfig.markerColor[0], this.pointConfig.markerColor[1], this.pointConfig.markerColor[2], this.pointConfig.markerColor[3]) //полученные из конфига значения цвета
    );

    // Создание блипа
    this.blip = new alt.PointBlip(this.position.x, this.position.y, this.position.z);
    this.blip.sprite = this.pointConfig.blipSprite;
    this.blip.color = this.pointConfig.blipColor;
    this.blip.name = this.pointConfig.name;
    this.blip.shortRange = this.pointConfig.blipShortRange;

    // Создание колшейпа
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

// Класс точки с логикой для точки погрузки/разгрузки
class PointBase {
    constructor(type, deliveryJob, pointVisuals) {
        this.type = type;
        this.deliveryJob = deliveryJob;
        this.pointVisuals = pointVisuals;
        
    }

    // Метод PointLoad - инкапсулирует поведение точки погрузки
    PointLoad(colshape, entity) {
        const player = alt.Player.local;
        /*
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;
            entity = player.vehicle;
        }
        */
        // Проверка на разрешенные модели авто
        if (player.vehicle && !this.deliveryJob.allowedVehicles.includes(player.vehicle.model)) {
            drawNotification('Транспорт не подходит для перевозки');
            return;
        }

        notificationManager.showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");
        
    //    this.deliveryJob.setupKeyPressHandler('loading', player.vehicle, this);
    }

    // Метод PointUnload - инкапсулирует поведение точки разгрузки
    PointUnload(colshape, entity) {
        const player = alt.Player.local;
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;
            entity = player.vehicle;
        }

        // Проверка что это тот же транспорт
        if (player.vehicle && this.deliveryJob.vehicleId !== player.vehicle.id) {
            drawNotification('Это не тот транспорт, в который был загружен груз');
            return;
        }

        notificationManager.showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");
        this.deliveryJob.setupKeyPressHandler('unloading', player.vehicle, this);
    }
}



new DeliveryJobClient();

//Добавить в DeliveryJobClient создание точек полиции через PointBase
//переделать createLoadingPoint и PointBase (много ненужной информации)
// избавиться от const notificationManager = new NotificationManager();