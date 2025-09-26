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
                console.log('Notification manager initialized SUCCESS');
            } else {
                console.log('Notification manager did not initialize FAILURE (timeout)');
            }
    }

    showPersistent(title, text, id = null) {
        if (!this.isInitialized) {
            console.log('Notification manager не инициализирован');
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
            
            alt.onServer('client:startDelivery', () => {
                this.startNewOrder(cargoType);
                /*
                this.destroyAllPoints();
                this.loadedvehid = null;
                this.cargoBase.loadtype = null;
                this.selectRandomLoadingPoint();
                */
            });

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

}

// Конкретный заказ на клиенте, создается только при старте доставки у конкретного игрока (не при входе на сервер)
class DeliveryOrder {
    constructor(cargoType, unloadingPoints, loadingPoints, allowedVehicles, policeStations, notificationSystem, vehicleBlocker) {
        
        
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
            this.loadingPoint = loadingPoints[Math.floor(Math.random() * loadingPoints.length)];
            this.unloadingPoint = unloadingPoints[Math.floor(Math.random() * unloadingPoints.length)];
            
            // Проверка для нелегального 
            if (this.cargoType === 'Illegal') {
                this.distanceFromPoliceStations();
            }
            
            resolve();
        });
    }

    distanceFromPoliceStations() {
        const minDistance = 350;
        
        let isTooClose = policeStations.some(station => {
            const distance = this.unloadingPoint.distanceTo(station);
            return (distance < minDistance); //если distance меньше чем 350 isTooClose = true 
        });
        
        if (isTooClose === true) {
            // Перевыбираем точку разгрузки, не меняя точки погрузки
            this.unloadingPoint = unloadingPoints[Math.floor(Math.random() * unloadingPoints.length)];
            this.distanceFromPoliceStations(); // Рекурсивная проверка
        }
    }

    createLoadingPoint() {
            const pointConfig = this.loadingPoint;
            // инициализируется класс отвечающий за создание точек
            this.loadingPoint = new PointBase(
                'loading',
                new alt.Vector3(pointConfig.x, pointConfig.y, pointConfig.z),
                pointConfig.radius,
                pointConfig.markerType,
                pointConfig.blipSprite
            );
            this.loadingPoint.create();
        }

}


class PointBase {
    constructor(type, position, radius, markerType, blipSprite) {
        this.type = type;
        this.position = position;
        this.radius = radius;
        this.markerType = markerType;
        this.blipSprite = blipSprite;
        this.marker = null;
        this.blip = null;
        this.colshape = null;
    }

    create() {
        // Создание маркера
        this.marker = new alt.Marker(
            this.markerType,
            this.position,
            new alt.RGBA(255, 0, 0, 200)
        );

        // Создание блипа
        this.blip = new alt.PointBlip(this.position.x, this.position.y, this.position.z);
        this.blip.sprite = this.blipSprite;
        this.blip.color = 1;
        this.blip.shortRange = true;

        // Создание колшейпа
        this.colshape = new alt.ColshapeSphere(
            this.position.x, 
            this.position.y, 
            this.position.z, 
            this.radius
        );

        return this;
    }

    destroy() {
        if (this.marker) this.marker.destroy();
        if (this.blip) this.blip.destroy();
        if (this.colshape) this.colshape.destroy();
    }
}

new NotificationManager();
new DeliveryJobClient();

//Добавить в DeliveryJobClient создание точек полиции через PointBase
//переделать createLoadingPoint и PointBase (много ненужной информации)