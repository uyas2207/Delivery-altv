import * as alt from 'alt-client';

import { PointBase } from '@classes/PointBase';
import { VehicleBlocker } from '@classes/VehicleBlocker';
import { PointVisuals } from '@classes/PointVisuals';
//import { NotificationManager } from '@classes/clientNotificationManager';

// Конкретный заказ на клиенте, создается только при старте доставки у конкретного игрока (не при входе на сервер)
export class DeliveryOrder {
    constructor(cargoType, config, policeColshapes) {
        //Данные из конфига
        this.cargoType = cargoType; //тип груза CommonCargo, HardCargo, DangerCargo, IllegalCargo
        this.config = config;   // (все loadingPoints, все unloadingPoints, все allowedVehicles, все policeStations)
        this.policeColshapes = policeColshapes;

        
        //this.state = DeliveryState.EMPTY;    //'empty'			нет активного заказа (провален или выполнен)
        this.loadingPoint = null;   //текущая точка погрузки
        this.unloadingPoint = null; //текущая точка разгрузки
        this.loadedVehId = null;    //сетевой id загруженной машины
        this.deliveryJobClient = null; //переменная для хранения ссылки

        this.pointBaseType = {LOADING: 'loading', UNLOADING: 'unloading'}; // тип точки передается в Pointbase (и нигде не используется)
    }

    //смена текщего состояния доставки
    changeState(state) {
        this.state = state;
        alt.log(`Изменился this.state на ${this.state}`);
    }

    async start() {
        await this.selectPoints();
        this.createLoadingPoint();
        //this.state = DeliveryState.WAITING_FOR_LOADING;   //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
    }

    selectPoints() {
        return new Promise((resolve) => {
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
    async distanceFromPoliceStations() {
        const minDistance = 350;

        // unloadingPoint в Vector3 для расчета расстояния
        const unloadingPos = new alt.Vector3(this.unloadingPoint.x, this.unloadingPoint.y, this.unloadingPoint.z);
        
        let isTooClose = this.config.policeStations.some(station => {
            const stationPos = new alt.Vector3(station.x, station.y, station.z);
            const distance = unloadingPos.distanceTo(stationPos);
            alt.log(`Расстояние до полицейского участка ${station.name}: ${distance}`);
            return (distance < minDistance); //если distance меньше чем 350 isTooClose = true 
        });
        
        if (isTooClose) {
            // Перевыбираем точку разгрузки, не меняя точки погрузки
            alt.log(`Точка разгрузки слишком близко к полиции, выбираентся новая...`);
            this.unloadingPoint = this.config.unloadingPoints[Math.floor(Math.random() * this.config.unloadingPoints.length)];
            this.distanceFromPoliceStations(); // Рекурсивная проверка
            //если вдруг будет в конфиге слишком много точек близко к полиции что бы были временные промежутки между проверками (+ можно доавбить ограничение на количество повторных выборов точки разгрузки)
            await new Promise(resolve => alt.setTimeout(resolve, 10));
        }
    }

    createLoadingPoint() {
        // создает визуальные элементы (маркеры, блипы и колшейпы)
        const pointVisuals = new PointVisuals(this.loadingPoint).create();
        
        // создает PointBase с поведением (логика точки погрузки/разгрузки)
        this.loadingPoint = new PointBase(this.pointBaseType.LOADING, this, pointVisuals);
    }

    createUnloadingPoint() {
        // создает визуальные элементы (маркеры, блипы и колшейпы)
        const pointVisuals = new PointVisuals(this.unloadingPoint).create();
        
        // создает PointBase с поведением (логика точки погрузки/разгрузки)
        this.unloadingPoint = new PointBase(this.pointBaseType.UNLOADING, this, pointVisuals);
    }

    handleColshapeEnterDeliveryOrder(colshape) {
        alt.log(`alt.Player.local.vehicle.id: ${alt.Player.local.vehicle.id}`)
        
        // если в будущем будет добавлено больше колшейпов проверка handleColshapeEnterDeliveryOrder будет return
        if (!this.loadingPoint || !this.unloadingPoint || !this.policeColshapes) return;
        // если 'waiting_for_loading' значит колшейп точки погрузки
        if (this.state === DeliveryState.WAITING_FOR_LOADING) {    //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
            if (colshape === this.loadingPoint.pointVisuals.colshape){
                this.loadingPoint.PointLoad(colshape, alt.Player.local.vehicle);
            }
        } 
        //если 'delivering' значит колшейп точки разгрузки
        if (this.state === DeliveryState.DELIVERING) {  //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
            if (colshape === this.unloadingPoint.pointVisuals.colshape){
                this.unloadingPoint.PointUnload(colshape, alt.Player.local.vehicle);
           }
        }
        //если колшейп полицейский и груз Illegal и в колшейп вошли на загруженной машине
        if(colshape.isPoliceZone){
            if ((this.cargoType === 'Illegal') && (alt.Player.local.vehicle.id === this.loadedVehId)){
                alt.emitServer('client:failDelivery');  //отправляет на сервер информацию о провале доставки
            }
        }
    }

    handleColshapeLeave(colshape) {
    // Очищаем обработчики клавиш при выходе из колшейпа (только если открыта webview)
        if (this.state === DeliveryState.WAITING_FOR_LOADING && this.loadingPoint) {     //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
                this.loadingPoint.cleanup();
        }
        if (this.state === DeliveryState.DELIVERING && this.unloadingPoint) {   //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
                this.unloadingPoint.cleanup();
        }
    }
    //процесс погрзки (после проверки на соблюдение всех необходимых для нее требований)
    async executeLoading(vehicle) {
        const vehicleBlocker = new VehicleBlocker();
        NotificationManager.getInstance().drawNotification('Начало погрузки...', true);   //true значит что уведмоление пропадет через 3 чекунды
        await vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится

        this.loadedVehId = vehicle.id;

        this.loadingPoint.pointVisuals.destroy();
        this.createUnloadingPoint();
        //this.state = DeliveryState.DELIVERING  //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
        
        NotificationManager.getInstance().drawNotification(`Погрузка завершена! Груз: ${this.cargoType}`);
        alt.emitServer('client:startLoading', this.loadedVehId);    //передает на сервер что игрок погрузил груз

    }
    //процесс разгрузки (после проверки на соблюдение всех необходимых для нее требований)
    async executeUnloading(vehicle) {
        const vehicleBlocker = new VehicleBlocker();
        NotificationManager.getInstance().drawNotification('Начало разгрузки...', true);   //true значит что уведмоление пропадет через 3 чекунды
        await vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится

        this.loadedVehId = null;

        this.unloadingPoint.pointVisuals.destroy();
        //this.state = DeliveryState.EMPTY;   //'empty'			нет активного заказа (провален или выполнен)
        
        alt.emitServer('client:completeDelivery');
        NotificationManager.getInstance().drawNotification(`Доставка завершена! Груз: ${this.cargoType}`);

        this.deliveryJobClient.currentOrder = null;

    }

     cancel() {
        // полная очистка ресурсов
        if (this.state === DeliveryState.WAITING_FOR_LOADING) { //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
            this.loadingPoint.cleanup();
            this.loadingPoint.pointVisuals.destroy();
            //this.state = DeliveryState.EMPTY;   //'empty'			нет активного заказа (провален или выполнен)
        }
        if (this.state === DeliveryState.DELIVERING) {  //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
            this.unloadingPoint.cleanup();
            this.unloadingPoint.pointVisuals.destroy();
            this.loadedVehId = null;
            //this.state = DeliveryState.EMPTY;   //'empty'			нет активного заказа (провален или выполнен)
        }
        
        // обнуление в родители
        if (this.deliveryJobClient) {
            this.deliveryJobClient.currentOrder = null;
        }
    }

}