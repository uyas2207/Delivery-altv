import * as alt from 'alt-client';
import * as native from "natives";

export class ClientEvents {
    static setupClientEvents(deliveryJobClient) {
       alt.log('2. Инициализация системы доставки.');
               // получение данных из конфига с сервера
               alt.onServer('initLoadingPoints', (points) => {
                   deliveryJobClient.config.loadingPoints = points;
               });
               // получение данных из конфига с сервера
               alt.onServer('initUnloadingPoints', (points) => {
                   deliveryJobClient.config.unloadingPoints = points;
               });
               // получение данных из конфига с сервера
               alt.onServer('initPoliceStations', (points) => {
                   deliveryJobClient.config.policeStations = points;
                   deliveryJobClient.createPoliceBlipsColshapes();  //сразу при входе на сервер будет точка погрузки 
               });
               // получение данных из конфига с сервера
               alt.onServer('initAllowedVehicles', (VehHash) => {
                   deliveryJobClient.config.allowedVehicles = VehHash;
               });
               // при старте заказа приходит с сервера client:startDelivery, и начинается заказ на клиенте
               alt.onServer('client:startDelivery', (cargoType) => {
                   deliveryJobClient.startNewOrder(cargoType);  //тип груза определяется на сервере
                   alt.log(`cargoType ${cargoType}`);
               });
               // нужно для очистки информации о грузе при провале доставки
               alt.onServer('client:cancelDelivery', () => {
                   deliveryJobClient.cancelCurrentOrder();
               });
               //для очистки обработчиков после выхода игрока с сервера
               alt.onServer('client:destroyDeliveryJob',() => {
                   deliveryJobClient.destroy();
               });
               //для смены состояния доставки
               alt.onServer('delivery:stateChanged', (state) => {
                   deliveryJobClient.changeCurrentOrderState(state);
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
               alt.on('entityEnterColshape', deliveryJobClient.handleEnterColshapeDeliveryJobClient.bind(deliveryJobClient));
               alt.on('entityLeaveColshape', deliveryJobClient.handleLeaveColshapeDeliveryJobClient.bind(deliveryJobClient));
    }
}