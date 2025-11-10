import * as alt from 'alt-client';
import * as native from "natives";

import { PointVisuals } from '@classes/PointVisuals';
//import { NotificationManager } from '@classes/clientNotificationManager';
import { DeliveryOrder } from '@classes/DeliveryOrder';


//import { DeliveryState } from '@shared/Consts.js';



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
        this.loadingMarkerType = null;  //текщая точка погрузки
        this.unloadingMarkerType = null;    //текущая точка разгрузк
        this.policeColshapes = []; // Массив для хранения колшейпов полиции
        
        //this.state = DeliveryState.EMPTY;     //'empty'			нет активного заказа (провален или выполнен)
        this.currentOrder = null;   // В будущем класс для конкретного заказа, пока что null что бы не использовать что либо что относится только к конкретному заказау до того как игрок начнет конкретный заказ

       // this.vehicleBlocker = new VehicleBlocker(); //для блокировки на разгрузке/погрузке
        
        this.initializeNotificationManager();

        this.init();
    }

    // метод для инициализации NotificationManager
    async initializeNotificationManager() {
        alt.log('1. Инициализация NotificationManager');
        // получает экземпляр Singleton (создается при первом вызове)
        const notificationManager = NotificationManager.getInstance();
        
        //инициализирует WebView
        await notificationManager.initialize();
            
        alt.log('1. NotificationManager инициализирован через DeliveryJobClient');
    }

    init() { 
        alt.log('2. Инициализация системы доставки.');
        // получение данных из конфига с сервера
        alt.onServer('initLoadingPoints', (points) => {
            this.config.loadingPoints = points;
        });
        // получение данных из конфига с сервера
        alt.onServer('initUnloadingPoints', (points) => {
            this.config.unloadingPoints = points;
        });
        // получение данных из конфига с сервера
        alt.onServer('initPoliceStations', (points) => {
            this.config.policeStations = points;
            this.createPoliceBlipsColshapes();  //сразу при входе на сервер будет точка погрузки 
        });
        // получение данных из конфига с сервера
        alt.onServer('initAllowedVehicles', (VehHash) => {
            this.config.allowedVehicles = VehHash;
        });
       
        // при старте заказа приходит с сервера client:startDelivery, и начинается заказ на клиенте
        alt.onServer('client:startDelivery', (cargoType) => {
            this.startNewOrder(cargoType);  //тип груза определяется на сервере
            alt.log(`cargoType ${cargoType}`);
        });
        // нужно для очистки информации о грузе при провале доставки
        alt.onServer('client:cancelDelivery', () => {
            this.cancelCurrentOrder();
        });
        //для очистки обработчиков после выхода игрока с сервера
        alt.onServer('client:destroyDeliveryJob',() => {
            this.destroy();
        });
        //для смены состояния доставки
        alt.onServer('delivery:stateChanged', (state) => {
            this.changeCurrentOrderState(state);
        });
        // визуальный взрыв при провале груза типа danger
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
    //создание полицеских блипов и колшейпов
    createPoliceBlipsColshapes() {
        this.config.policeStations.forEach((station, index) => {
            const policeVisuals = new PointVisuals(station).create();
        
            // добавление дополнительных свойст для колшейпов после создания создания
            policeVisuals.colshape.isPoliceZone = true; // нужно для проверки что автомобиль попал именно в полицейский колшейп, а не какой то другой
            policeVisuals.colshape.policeStationId = index; //нужно для проверки в какой из полицейских участков заехал автомобиль
            //добавление данных созданной точки в массив
            this.policeColshapes.push(policeVisuals.colshape);
        });
        alt.log(`Создано ${this.config.policeStations.length} полицейских участков`);
    }
    // создание заказа доставки 
    startNewOrder(cargoType) {
        //если существует текущий заказ он отменяется
        if (this.currentOrder) {
            this.cancelCurrentOrder();
        }
        // инициализируется класс конкретного заказа только при старте конкретного заказа
        this.currentOrder = new DeliveryOrder(
            cargoType,
            this.config,
            this.policeColshapes
        );
        this.currentOrder.deliveryJobClient = this; // cсылка для последующего обнуления
        this.currentOrder.start();  //старт конкретного заказа в DeliveryOrder
    }

    cancelCurrentOrder() {
        if (this.currentOrder) {
            this.currentOrder.cancel(); //отмена конкретного заказа в DeliveryOrder
            this.currentOrder = null;   //обнуление ссылки
        }
    }

    changeCurrentOrderState(state){
        if (this.currentOrder) {
            this.currentOrder.changeState(state); //смена состояния для конкретного заказа в DeliveryOrder
        }
    }
    //логика на вход в колшейп
    handleEnterColshapeDeliveryJobClient(colshape, entity) {
        const player = alt.Player.local;
        //проверка на то что игрок в машине, в доставке если игрок не в машине ничего никогда не происходит
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;
        }
        // проверка на случай если будут добавлены еще колшейпы и в них зайдет игрок без заказа доставки
        if (this.currentOrder !== null) {
            alt.log(`Вошел в колшейп`);
            this.currentOrder.handleColshapeEnterDeliveryOrder(colshape);   //логика входа в колшейп у конкретного заказа
        }
    }
    //выход из колшейпа
    handleLeaveColshapeDeliveryJobClient(colshape, entity) {
        if (NotificationManager.getInstance().isWebViewOpen){
            NotificationManager.getInstance().hidePersistent();
            //очищает обработчик нажатия клавиши (который создается только при открытии WebViewOpen, поэтому в других случаях его можно не очищать)
            this.currentOrder.handleColshapeLeave(colshape, entity);
        }
    }     

}




new DeliveryJobClient();