// <reference types="@altv/types-client" />
// <reference types="@altv/types-natives" />

// alt:V built-in module that provides client-side API.
import * as alt from 'alt-client';
// alt:V built-in module that provides natives API (functions from GTA V).
import * as native from "natives";

alt.log('Client-side has loaded!');

alt.onServer('Server:Log', (msg1, msg2) => {
    alt.log(`Message From Server: ${msg1}`);
    alt.log(`Message From Server: ${msg2}`);
});


function drawNotification(message, autoHide = false) {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(message);
    const notificationId = native.endTextCommandThefeedPostTicker(false, false);
    
    // Таймер для скрытия уведомления через 3 секунды
     if (autoHide !== false) {
        setTimeout(() => {
          // Удаление уведомления по его ID
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
        try {
            this.webView = new alt.WebView('http://resource/client/html/index.html');
            await new Promise(resolve => {
                this.webView.on('load', resolve);
                alt.setTimeout(resolve, 2000);
            });
            
            this.isInitialized = true;
            console.log('Notification manager initialized');
        } catch (error) {
            console.error('Failed to initialize notification manager:', error);
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

const notificationManager = new NotificationManager();

class VehicleBlocker {
    constructor() {
        this.vehBlocked = false; 
    }
    blockPlayerVehicle(player) {
         if (this.vehBlocked == true) return;
         if (!player || !player.valid || !player.vehicle) return;
         
         player.vehicle.frozen = true;
         this.vehBlocked = true; 
         alt.log(`Авто заблокировано`);
    }
    unblockPlayerVehicle(player) {
         if (this.vehBlocked == false) return;
         if (!player || !player.valid) return;
         player.vehicle.frozen = false;
         this.vehBlocked = false;
          alt.log(`Авто разблокировано`);
    }
}

class DeliveryJob {
    constructor() {
        this.keyCheckHandler = null;    
        this.allowedVehicles = [];  
        this.loadedvehid = null;    //сетевой id машины в которую был загружен заказ
        this.loadingBlips = [];
        this.loadingPoints = [];
        this.unloadingPoints = [];
        this.policeStations = [];
        this.loadingPoint = null;
        this.unloadingPoint = null;
        this.unloadingBlips = [];
        this.markers = [];
        this.colshapes = [];
        this.points = [];
        this.loadingMarkerType = null;  //для проверки текущего состояния заказа (цель точка погрузки)
        this.unloadingMarkerType = null;    //для проверки текущего состояния заказа (цель точка разгрузки)
        this.currentMarkerType = null;
        this.markerColshapeMap = new Map();
        this.vehicleBlocker = new VehicleBlocker();
        this.cargoBase = new DeliveryJob.IllegalCargo();
        this.registerColshapeHandlers();
        this.init();
    }

    init() { 
        // получение данных из конфига с сервера
        alt.onServer('initLoadingPoints', (points) => {
            this.loadingPoints = points;
            this.selectRandomLoadingPoint();
        });
         alt.onServer('initUnloadingPoints', (points) => {
            this.unloadingPoints = points;
        });
         alt.onServer('initPoliceStations', (points) => {
            this.policeStations = points;
            this.createPoliceBlips();
            this.cargoBase.createPoliceColshapes(this.policeStations);
        });
         alt.onServer('initAllowedVehicles', (VehHash) => {
            this.allowedVehicles = VehHash;
        });
        alt.onServer('client:delivery', () => {
            this.destroyAllLoadingPoints();
            this.loadedvehid = null;
            this.cargoBase.loadtype = null;
            this.selectRandomLoadingPoint();
        });
        alt.onServer('client:clearLoadedVehicle',() => {
            this.destroyAllLoadingPoints();
            this.loadedvehid = null;
            this.cargoBase.loadtype = null;
        });

        alt.onServer("explode",() =>{
            const player = alt.Player.local;
            native.addExplosion(
                player.vehicle.pos.x,
                player.vehicle.pos.y,
                player.vehicle.pos.z,
                9, // тип взрыва (9 - Vehicle)
                5.0, // радиус
                true, // звук
                false, // невидимый огонь
                0.0, // камера shake
                true
            );
        });
    }

    registerColshapeHandlers() {
        alt.on('entityEnterColshape', (colshape, entity) => {
            this.handleEntityEnterColshape(colshape, entity);
        });
        
        alt.on('entityLeaveColshape', (colshape, entity) => {
            this.handleEntityLeaveColshape(colshape, entity);
        });
    }

handleEntityEnterColshape(colshape, entity) {
        
        if (this.currentMarkerType === this.loadingMarkerType){
            this.PointLoad(colshape, entity);
        }
        if (this.currentMarkerType === this.unloadingMarkerType){
            this.PointUnload(colshape, entity);
        }
        if (this.cargoBase instanceof DeliveryJob.IllegalCargo && this.cargoBase.policeColshapes && this.cargoBase.policeColshapes.includes(colshape) && (this.cargoBase.loadtype === 'Illegal')) {
            const shouldDestroy = this.cargoBase.handleEnterPoliceZone(colshape, entity, this.loadedvehid); 
            if (shouldDestroy === true) {
                this.destroyAllLoadingPoints();
            }
        }
}


    handleEntityLeaveColshape(colshape, entity) {
        if (entity instanceof alt.Player) {
            const marker = this.markerColshapeMap.get(colshape);
            if (notificationManager.isWebViewOpen !== false){
            notificationManager.hidePersistent();
            }
            if (marker && entity === alt.Player.local && marker.originalColor) {
                marker.color = marker.originalColor;
            }
        }
    }

    PointLoad(colshape, entity){
            const player = alt.Player.local;
            const marker = this.markerColshapeMap.get(colshape);
            if (entity instanceof alt.Player) {
                        if (!player.vehicle) return;
                        entity = player.vehicle; // Переключение на проверку транспорта
                    }
                    if (marker) {
                        // Если игрок в транспорте, проверка на разрешенные vehicle
                        if (player.vehicle) {
                          //  const vehicleModel = player.vehicle.model;
                            
                            if (!this.allowedVehicles.includes(player.vehicle.model)) {
                                alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                                alt.log(`Неправильное авто`);
                                return;
                            }
                        }
                        marker.originalColor = marker.color;
                        marker.color = new alt.RGBA(0, 255, 0, 200);
                        alt.log(`Вошел в colshape`);
                        notificationManager.showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");
    
                        this.keyCheckHandler = alt.everyTick(() => {
                        if (alt.isKeyDown(69) && (notificationManager.isWebViewOpen !== false) && (this.currentMarkerType === this.loadingMarkerType)) {
                        const marker = this.markerColshapeMap.get(colshape);
                            notificationManager.hidePersistent();
                            if (!player.vehicle) {
                                    drawNotification('Вы не находитесь в транспорте');
                                    return;
                            }
                            if (!this.allowedVehicles.includes(player.vehicle.model)) {
                                alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                                drawNotification('Неправильное авто');
                                return;
                            }
                            drawNotification('Погрузка началась...', true);
                            this.vehicleBlocker.blockPlayerVehicle(player);
                            this.loadedvehid = player.vehicle.id;
                            alt.log(`Сетевой ID загруженного авто: ${this.loadedvehid}`);
                            setTimeout(() => {
                                this.vehicleBlocker.unblockPlayerVehicle(player);
                                this.destroyAllLoadingPoints();
                                this.cargoBase.SelectCargoType();
                                alt.emitServer('client:setLoadedVehicle', String(this.cargoBase.loadtype), this.loadedvehid);
                                alt.log(`this.cargo.loadtype: ${ this.cargoBase.loadtype}`);
                                this.selectRandomUnloadingPoint();
                                }, 3000);
                        }
                        });
                        if (this.loadedvehid !== null){
                        alt.clearEveryTick(this.keyCheckHandler);
                        this.keyCheckHandler = null;
                        }
                    }
    }

    PointUnload(colshape, entity){
        const player = alt.Player.local;
        const marker = this.markerColshapeMap.get(colshape);
        if (entity instanceof alt.Player) {
                        if (!player.vehicle) return;
                        entity = player.vehicle; // Переключение на проверку транспорта
                    }
                    if (marker) {
                        // Если игрок в транспорте, проверяем разрешенные vehicle
                        if (player.vehicle) {
                            const vehicleModel = player.vehicle.model;
                            
                            if (!this.allowedVehicles.includes(vehicleModel)) {
                                alt.log(`Vehicle ${vehicleModel} is not allowed`);
                                alt.log(`Неправильное авто`);
                                return;
                            }
                            if (this.loadedvehid !== player.vehicle.id){
                                drawNotification('Это не тот автомобиль который вы загружали');
                                 alt.log(`'Это не тот автомобиль который вы загружали`);
                                return;
                            }
                        }
                        alt.log(`Вошел в colshape`);
                        notificationManager.showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");
                        this.keyCheckHandler = alt.everyTick(() => {
                        if (alt.isKeyDown(69) && (notificationManager.isWebViewOpen !== false) && (this.currentMarkerType === this.unloadingMarkerType)) {
                            notificationManager.hidePersistent();                       
                            if (!player.vehicle) {
                                drawNotification('Вы не находитесь в транспорте');
                                return;
                            }
                            drawNotification('Разгрузка началась...', true);
                            this.vehicleBlocker.blockPlayerVehicle(player);
                            setTimeout(() => {
                                this.vehicleBlocker.unblockPlayerVehicle(player);
                                this.cargoBase.CargoPayment();
                                this.loadedvehid = null;
                                this.cargoBase.loadtype = null;
                                this.destroyAllLoadingPoints();
                                }, 3000);
                        }
                        });
                        if (this.loadedvehid === null){
                        alt.clearEveryTick(this.keyCheckHandler);
                        this.keyCheckHandler = null;
                        }
                    }
    }
    
    createBlip(point, sprite, color) {
            const blip = new alt.PointBlip(point.x, point.y, point.z);
            blip.sprite = sprite;
            blip.color = color;
            blip.name = point.name;
            blip.scale = point.blipscale !== undefined ? point.blipscale : 1.0;
            blip.shortRange = point.blipshortRange !== undefined ? point.blipshortRange : false;
            return blip;
    }

    createMarker(point, markerType, color) {
            const markerPos = new alt.Vector3(point.x, point.y, point.z);
            const marker = new alt.Marker(
                markerType,
                new alt.Vector3(point.x, point.y, point.z),
                new alt.RGBA(color[0], color[1], color[2], color[3])
            );
        alt.log(`Создан маркер для: ${point.name}`);
        alt.log(`Координаты маркера: (${markerPos.x}, ${markerPos.y}, ${markerPos.z})`);
        alt.log(`Параметры маркера: type=${markerType}, color=[${color.join(', ')}]`);
        this.currentMarkerType = markerType;
            return marker;
    }
    
    createColshape(point, radius, marker) {
        const colshape = new alt.ColshapeSphere(point.x, point.y, point.z, radius);
        this.markerColshapeMap.set(colshape, marker);
        this.colshapes.push(colshape);
        
        return colshape;
    }

    createBlipWithMarker(point) {
        alt.log(`Создание блипа и маркера для точки: ${point.name}`);
        alt.log(`Данные точки:`, JSON.stringify(point));

        const blip = this.createBlip(
            point,
            point.blipSprite,
            point.blipColor
        );
        const marker = this.createMarker(point, point.markerType, point.markerColor);
        const colshape = this.createColshape(point, point.colshapeRadius, marker);
        this.colshapes.push(colshape);
        alt.log(`Создан colshape для точки: ${point.name} с радиусом: ${point.colshapeRadius}`);
        return { blip, marker };
    }

    addMarker(marker) {
        if (marker) {
            this.markers.push(marker);
            alt.log(`Маркер добавлен в массив markers. Всего маркеров: ${this.markers.length}`);
        } else {
            alt.log(`Ошибка: попытка добавить undefined маркер`);
        }
    }

destroyAllLoadingPoints() {
    let destroyedCount = 0;

    this.markers.forEach(marker => {
        if (marker && marker.destroy) {
            marker.destroy();
            destroyedCount++;
        }
    });
    
    this.unloadingBlips.forEach(blip => {
        if (blip && blip.destroy) {
            blip.destroy();
            destroyedCount++;
        }
    });
    
    this.loadingBlips.forEach(blip => {
        if (blip && blip.destroy) {
            blip.destroy();
            destroyedCount++;
        }
    });
    
    this.colshapes.forEach(colshape => {
        if (colshape && colshape.destroy) {
            colshape.destroy();
            destroyedCount++;
        }
    });

    this.markers = [];
    this.unloadingBlips = [];
    this.loadingBlips = [];
    this.colshapes = [];
    this.markerColshapeMap.clear();
    this.points = [];
    
    alt.log(`Уничтожено ${destroyedCount} элементов точек погрузки`);
}

selectRandomLoadingPoint() {
    const randomIndex = Math.floor(Math.random() * this.loadingPoints.length);
    this.loadingPoint = this.loadingPoints[randomIndex];
    const item = this.createBlipWithMarker(this.loadingPoint);
    
    this.addMarker(item.marker);
    this.loadingBlips.push(item.blip); // Добавление блипа в массив
    alt.log(`Выбрана точка погрузки: ${this.loadingPoint.name}`); 
    this.loadingMarkerType = this.loadingPoint.markerType;  // запоминает данные из конфига о типе маркера погрузки, нужно для проверки состояния заказа
}

selectRandomUnloadingPoint() {
    const randomIndex = Math.floor(Math.random() * this.unloadingPoints.length);
    this.unloadingPoint = this.unloadingPoints[randomIndex];
    // Проверка расстояния до полицейских участков (только для Illegal груза)
    if (this.cargoBase instanceof DeliveryJob.IllegalCargo && this.cargoBase.loadtype === 'Illegal') {
        const isDangerous = this.checkDistanceToPoliceStations(this.unloadingPoint);
        if (isDangerous === true) {
            alt.log('Выбрана близкая к полиции точка, выбирается другая...');
            this.selectRandomUnloadingPoint(); //рекурсивный выбор точки
            return;
        }
    }
    const item = this.createBlipWithMarker(this.unloadingPoint); 
    this.addMarker(item.marker);
    this.unloadingBlips.push(item.blip); // Добавление блипа в массив
    alt.log(`Выбрана точка разгрузки: ${this.unloadingPoint.name}`);
    this.unloadingMarkerType = this.unloadingPoint.markerType;
}

checkDistanceToPoliceStations(unloadingPoint) {
    const unloadingPos = new alt.Vector3(unloadingPoint.x, unloadingPoint.y, unloadingPoint.z);
    const isDangerous = this.cargoBase.policeColshapes.some((colshape, index) => {
   
        if (colshape && colshape.valid) {
            const policePos = colshape.pos;
            const distance = unloadingPos.distanceTo(policePos);
            if (distance < 350) {
                alt.log(`Участок ${index + 1}: участок находится на расстоянии ${distance.toFixed(2)} единиц`);
                return true;
            }
        }
        return false;
    });
    return isDangerous;
}

createPoliceBlips() {
    this.policeStations.forEach(station => {
        const item = this.createBlip( station, station.blipSprite, station.blipColor );
        });
    alt.log(`Создано ${this.policeStations.length} полицейских участков`);
}

static CargoBase = class {
    constructor() {
        this.loadtype = null;
        this.policeColshapes = [];
        this.cargoTypes = ['Illegal', 'Hard', 'Danger', 'Common'];
    }

SelectCargoType (){
    const randomIndex = Math.floor(Math.random() * this.cargoTypes.length);
    this.loadtype = this.cargoTypes[randomIndex];  
    alt.log(`Тип данных: ${typeof this.loadtype}, Значение: ${this.loadtype}`);
    drawNotification(`Загружен груз типа: ${this.loadtype}`);
}

CargoPayment (){
    switch (this.loadtype) {
        case 'Common':
            drawNotification('+1000\$');
        break;

        case 'Hard':
            drawNotification('+2000\$');
        break;

        case 'Danger':
            drawNotification('+3000\$');
        break;

        case 'Illegal':
            drawNotification('+1500\$');
        break;
        }
    }
};
    // Вложенный класс обычного груза
    static CommonCargo = class extends DeliveryJob.CargoBase {
        constructor() {
          super();
        }

    };
    
    // Вложенный класс тяжелого груза
    static HardCargo = class extends DeliveryJob.CargoBase {
        constructor() {
            super();
        }
        

        


    };
    
    // Вложенный класс опасного груза
    static DangerCargo = class extends DeliveryJob.CargoBase {
         constructor() {
            super();
        }
    };
    
    // Вложенный класс незаконного груза
    static IllegalCargo = class extends DeliveryJob.CargoBase {
        constructor() {
            super();
        this.policeColshapes = []; // Массив для хранения полицейских колшейпов
        }

    createPoliceColshapes(policeStations) { 
        policeStations.forEach((station) => {
            const policeColshape = new alt.ColshapeSphere(station.x, station.y, station.z, 350);
            this.policeColshapes.push(policeColshape);
        });
        alt.log(`Создано ${this.policeColshapes.length} полицейских колшейпов`);
    }

      handleEnterPoliceZone(colshape, entity, loadedvehid) {
        const player = alt.Player.local;
        if (entity instanceof alt.Player) {
                        if (!player.vehicle ) return false;
                        entity = player.vehicle; // Переключение на проверку транспорта
                        if (entity.id !== loadedvehid) return false;
            alt.log(`Вошел в зону полицейского участка, vehicle.id ${entity.id}`);
            drawNotification('Вы находились слишком близко к полицейскому участку'); 
            drawNotification('Заказ отменен!');
            return true; // true - нужно уничтожить точки
        }
        
    }
};
}
new DeliveryJob();