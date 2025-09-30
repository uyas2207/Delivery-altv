import * as alt from 'alt-client';
import * as native from "natives";

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

alt.onServer('drawNotification', drawNotification);

class NotificationManager {
    constructor() {
        this.webView = null;
        this.isInitialized = false;
        this.activeNotifications = new Map();
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
        this.activeNotifications.set(notificationId, true);
        return notificationId;
    }
    
    hidePersistent(id) {
        if (this.isInitialized && this.activeNotifications.has(id)) {
            this.webView.emit('hidePersistentNotification', id);
            this.activeNotifications.delete(id);
        }
    }

    cleanup() {
        this.activeNotifications.forEach((_, id) => this.hidePersistent(id));
        this.activeNotifications.clear();
    }
}

//const notificationManager = new NotificationManager();

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
                resolve(); // Если транспорт невалиден, сразу разрешаем промис
                alt.log('Ошибка, неправильный reslove')
            }
        });

    }
}


// Класс точки с логикой для точки погрузки/разгрузки
class PointBase {
    constructor(type, deliveryOrder, pointVisuals) {  //deliveryJob
        this.type = type;
        this.deliveryOrder = deliveryOrder;
        //this.deliveryJob = deliveryJob;
        this.pointVisuals = pointVisuals;
        this.keyPressHandler = null; // Добавляем свойство для хранения обработчика
    }

    // Метод PointLoad - инкапсулирует поведение точки погрузки
    PointLoad(colshape, entity) {
        const player = alt.Player.local;

        // Проверка на разрешенные модели авто
        if (!this.deliveryJob.allowedVehicles.includes(player.vehicle.model)) {
            drawNotification('Транспорт не подходит для перевозки');
            return;
        }

        this.setupKeyPressHandler("Погрузка", "E", () => {
            this.deliveryOrder.executeLoading(player.vehicle);
        });

     //   notificationManager.showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");
        /*
        //таких ситуаций в текущем коде быть не может, проверка есть на случай если потом будут добавлены еще обработчки при расширении функционала доставки
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик 1')
        }

        // Создаем новый обработчик для клавиши E
        this.keyPressHandler = (key) => {
            if ((key === 69) && (notificationManager.isWebViewOpen !== false) && (this.pointVisuals.position.distanceTo(player.pos) < 10)) {

                // Удаляем обработчик после нажатия
                this.cleanup();
                notificationManager.hidePersistent();
                if (!player.vehicle) {  // Если игрок заехал в колшеп на транспорте но вышел и нажал E ничего не происходит (WebView закрылось ранее поэтому ему придется перезаезжать в колшейп)
                        drawNotification('Вы не находитесь в транспорте');
                        return;
                }
                if (!this.deliveryJob.allowedVehicles.includes(player.vehicle.model)) { // снова проверка на правильное авто (вдруг игрок заехал в колшейп на правильном авто и невыходя из колшейпа пересел в неправильное авто)
                    alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                    drawNotification('Неправильное авто');
                    return;
                }
                alt.log('Началась погрузка');
                this.deliveryJob.executeLoading (player.vehicle);

            }   
        };

        // Регистрируем обработчик
        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик 1')
        */
    }

    // Метод PointUnload - инкапсулирует поведение точки разгрузки
    PointUnload(colshape, entity) {
        const player = alt.Player.local;

        // Проверка что это тот же транспорт
        if (this.deliveryJob.loadedVehId !== player.vehicle.id) {
            drawNotification('Это не тот транспорт, в который был загружен груз');
            return;
        }

        this.setupKeyPressHandler("Разгрузка", "E", () => {
            this.deliveryOrder.executeUnloading(player.vehicle);
        });
    //    notificationManager.showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");
/*
        this.keyPressHandler = (key) => {
            if ((key === 69) && (notificationManager.isWebViewOpen !== false) && (this.pointVisuals.position.distanceTo(player.pos) < 15)) {
                // Удаляем обработчик после нажатия
                this.cleanup();
                notificationManager.hidePersistent();
                //проверку ниже можно убрать, так как если игрок вышел из авто и/или пересел в другую машину ему это не даст никакого приемущества (но для логики игрового процесса стоит остаивть)
                if (!player.vehicle) {  // Если игрок заехал в колшеп на транспорте но вышел и нажал E ничего не происходит (WebView закрылось ранее поэтому ему придется перезаезжать в колшейп)
                        drawNotification('Вы не находитесь в транспорте');
                        return;
                }
                if (this.deliveryJob.loadedVehId !== player.vehicle.id) {
                    drawNotification('Это не тот транспорт, в который был загружен груз');
                return;
                }
                alt.log('Началась разгрузка');
                this.deliveryJob.executeUnloading (player.vehicle);


            }   
        };

        // Регистрируем обработчик
        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик разгрузки')
        */
    }

        // Метод для очистки обработчика keyPressHandler
        cleanup() {
            if (this.keyPressHandler) {
                alt.off('keydown', this.keyPressHandler);
                alt.log('Удален обработчик 2')
                this.keyPressHandler = null;
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

// Общая система управления доставкой создается при подключении игрока
class DeliveryJobClient {
    constructor() {
        this.unloadingPoints = [];
        this.loadingPoints = [];
        this.allowedVehicles = [];
        this.policeStations = [];

        this.loadingMarkerType = null;
        this.unloadingMarkerType = null;
        this.policeColshapes = []; // Массив для хранения колшейпов полиции
        
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
                alt.log(`cargoType ${cargoType}`);
            });

            alt.onServer('client:cancelDelivery', () => {
                this.cancelCurrentOrder();
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

        // Обработка входа/выхода из колшейпов
        alt.on('entityEnterColshape', this.handleEnterColshapeDeliveryJobClient.bind(this));
        alt.on('entityLeaveColshape', this.handleLeaveColshapeDeliveryJobClient.bind(this));

        }

        createPoliceBlips() {
                this.policeStations.forEach((station, index) => {
                    const item = this.createBlip(station, station.blipSprite, station.blipColor);
                    
                    const colshape = new alt.ColshapeSphere(station.x, station.y, station.z, 350);

                    colshape.policeStationId = index;
                    colshape.isPoliceZone = true;
            
                    this.policeColshapes.push(colshape);
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
        
        createPoliceColshapes() {}

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
                this.policeColshapes,
                
                this.notificationSystem,
                this.vehicleBlocker,
            );
            this.currentOrder.deliveryJobClient = this; // cсылка для последующего обнуления
            this.currentOrder.start();
        }

        cancelCurrentOrder() {
            if (this.currentOrder) {
                this.currentOrder.cancel();
                this.currentOrder = null;   //обнуление ссылки
            }
        }

    handleEnterColshapeDeliveryJobClient(colshape, entity) {
        const player = alt.Player.local;
        //проверка на то что игрок в машине, в доставке если игрок не в машине ничего никогда не происходит
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;
        }
        // проверка на случай если будут добавлены еще колшейпы и в них зайдет игрок без заказа доставки
        if (this.currentOrder !== null) {
            alt.log(`Вошел в колшейп`);
            this.currentOrder.handleColshapeEnterDeliveryOrder(colshape);
        }
    }

    handleLeaveColshapeDeliveryJobClient(colshape, entity) {
            if (notificationManager.isWebViewOpen !== false){
                notificationManager.hidePersistent();
                this.currentOrder.handleColshapeLeave(colshape, entity);
        }
    }     

}

// Конкретный заказ на клиенте, создается только при старте доставки у конкретного игрока (не при входе на сервер)
class DeliveryOrder {
    constructor(cargoType, unloadingPoints, loadingPoints, allowedVehicles, policeStations, policeColshapes, notificationSystem, vehicleBlocker) {
        //Данные из конфига
        this.cargoType = cargoType;
        this.unloadingPoints = unloadingPoints;
        this.loadingPoints = loadingPoints;
        this.allowedVehicles = allowedVehicles;
        this.policeStations = policeStations;
        this.policeColshapes = policeColshapes;
        this.notificationSystem = notificationSystem;
        this.vehicleBlocker = vehicleBlocker;
        
        this.state = 'empty';
        this.loadingPoint = null;
        this.unloadingPoint = null;
        this.loadedVehId = null;
        this.deliveryJobClient = null; //переменная для хранения ссылки
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
            
            
            // Проверка для нелегального 
            if (this.cargoType === 'Illegal') {
                this.distanceFromPoliceStations();
            }
            resolve();
        });
    }

    distanceFromPoliceStations() {
        const minDistance = 350;

        // Преобразуем unloadingPoint в Vector3 для расчета расстояния
        const unloadingPos = new alt.Vector3(this.unloadingPoint.x, this.unloadingPoint.y, this.unloadingPoint.z);
        
        let isTooClose = this.policeStations.some(station => {
            const stationPos = new alt.Vector3(station.x, station.y, station.z);
             const distance = unloadingPos.distanceTo(stationPos);
            alt.log(`Расстояние до полицейского участка ${station.name}: ${distance}`);
            return (distance < minDistance); //если distance меньше чем 350 isTooClose = true 
        });
        
        if (isTooClose === true) {
            // Перевыбираем точку разгрузки, не меняя точки погрузки
            alt.log(`Точка разгрузки слишком близко к полиции, выбираем новую...`);
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
        // Создаем визуальные элементы
        const pointVisuals = new PointVisuals(this.unloadingPoint).create();
        
        // Создаем PointBase с поведением
        this.unloadingPoint = new PointBase('unloading', this, pointVisuals);
    }

    handleColshapeEnterDeliveryOrder(colshape) {
        alt.log(`alt.Player.local.vehicle.id: ${alt.Player.local.vehicle.id}`)
        
       // alt.log(`this.unloadingPoint: ${this.unloadingPoint}`)
         //alt.log(`this.loadingPoint: ${this.loadingPoint}`)
        // если в будущем будет добавлено больше колшейпов
        if (!this.loadingPoint || !this.unloadingPoint || !this.policeColshapes) return;

        if (colshape === this.loadingPoint.pointVisuals.colshape && this.state === 'waiting_for_loading') {
            this.loadingPoint.PointLoad(colshape, alt.Player.local.vehicle);
        } 
        if (this.state === 'delivering') {
            if (colshape === this.unloadingPoint.pointVisuals.colshape){
                this.unloadingPoint.PointUnload(colshape, alt.Player.local.vehicle);
           }
        }
        
        if((this.cargoType === 'Illegal') && (alt.Player.local.vehicle.id === this.loadedVehId) && (colshape.isPoliceZone === true)){
            alt.log(`после проверки на illegal и loadedvehid`)
        alt.emitServer('client:failDelivery');
        }
        
    }

    handleColshapeLeave(colshape) {
    // Очищаем обработчики клавиш при выходе из колшейпа
        if (this.loadingPoint) {
            this.loadingPoint.cleanup();
        }
        if (this.unloadingPoint) {
            this.unloadingPoint.cleanup();
        }
    }

    async executeLoading(vehicle) {
        drawNotification('Начало погрузки...', true);   //true значит что уведмоление пропадет через 3 чекунды
        await this.vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится

        this.loadedVehId = vehicle.id;

        this.loadingPoint.pointVisuals.destroy();
        this.createUnloadingPoint();
        this.state = 'delivering';
        
        drawNotification(`Погрузка завершена! Груз: ${this.cargoType}`);
        alt.emitServer('client:startLoading', this.loadedVehId);

    }

    async executeUnloading(vehicle) {
        drawNotification('Начало разгрузки...', true);   //true значит что уведмоление пропадет через 3 чекунды
        await this.vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится
        drawNotification('Авто разгружено...', true);

        this.loadedVehId = null;

        this.unloadingPoint.pointVisuals.destroy();
        this.state = 'empty';
        
        alt.emitServer('client:completeDelivery');
        drawNotification(`Доставка завершена! Груз: ${this.cargoType}`);

        this.deliveryJobClient.currentOrder = null;

    }

     cancel() {
        // ПОЛНАЯ ОЧИСТКА РЕСУРСОВ
        if (this.state === 'waiting_for_loading') {
            alt.log(`ПОЛНАЯ ОЧИСТКА РЕСУРСОВ loadingPoint до`);
            this.loadingPoint.cleanup();
            this.loadingPoint.pointVisuals.destroy();
            this.state = 'empty';
        }
        if (this.state === 'delivering') {
            alt.log(`ПОЛНАЯ ОЧИСТКА РЕСУРСОВ unloadingPoint до`);
            this.unloadingPoint.cleanup();
            this.unloadingPoint.pointVisuals.destroy();
            this.loadedVehId = null;
            this.state = 'empty';
        }
        
        // ОБНУЛЕНИЕ В РОДИТЕЛЕ
        if (this.deliveryJobClient) {
            this.deliveryJobClient.currentOrder = null;
        }
    }

}






new DeliveryJobClient();

//Добавить в DeliveryJobClient создание точек полиции через PointBase
//переделать createLoadingPoint и PointBase (много ненужной информации передается)
// избавиться от const notificationManager = new NotificationManager();
// проверить нет ли неочищенных обработчиков (Map) колшейпов и тд