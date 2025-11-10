import * as alt from 'alt-server';
import { DeliveryState } from '@shared/Consts';

// Конкретный, личный заказ доставки
export class DeliveryJob {
    constructor(player, configManager) {
        this.player = player;   //id игрока которой выполняет доставку
        this.configManager = configManager; 
        this.cargo = null;          // текущий тип заказа
        this.loadedVehId = null;    //id загруженнного автомобился
        this.cargoTypes = this.configManager.getCargoTypes();  // Получаем типы грузов из configManager
        this.state = DeliveryState.EMPTY;
        this.damageHandlingInProgress = false; // для единоразовой обработки урона
    }
    //метод для смены сосотояния текщей доставки
    setState(newState) {
    this.state = newState;
    alt.log(`Изменился this.state на ${this.state}`);
    alt.emitClient(this.player, 'delivery:stateChanged', newState); //смена состояния заказа на клиенте
    }

    start() {
        const CargoClass = this.cargoTypes[Math.floor(Math.random() * this.cargoTypes.length)];
        this.cargo = new CargoClass();

        alt.log(`Выбран тип груза: ${this.cargo.type}`);
        alt.emitClient(this.player, 'client:startDelivery', this.cargo.type);
        this.setState(DeliveryState.WAITING_FOR_LOADING);  //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
    }

//запоминает loadedVehId
    Loaded(loadedVehId) {
        this.loadedVehId = loadedVehId;
        this.setState(DeliveryState.DELIVERING);  //автомобиль был загружен и едет до точки разгрузки, для проверок урона
        alt.log(`Loaded vehicle: ${loadedVehId}`);
    }

// выдает награду
    complete() {
        this.cargo.onSuccessfulDelivery(this.player);   // выдает награду
        this.loadedVehId = null;
        alt.log(`Delivery completed for ${this.player.id}`);
        this.setState(DeliveryState.EMPTY);   //'empty'			нет активного заказа (провален или выполнен)
    }

// отменяет текущий заказ
    cancel() {
        alt.emitClient(this.player, 'client:cancelDelivery');
        this.loadedVehId = null;
        alt.log(`Delivery cancelled for ${this.player.id}`);
        this.setState(DeliveryState.EMPTY);  //'empty'			нет активного заказа (провален или выполнен)
    }

// отменяет текущий заказ + отправляет уведомление с причиной провала
    fail() {
        this.cargo.onDeliveryFailed(this.player);
        alt.emitClient(this.player, 'client:cancelDelivery');
        this.loadedVehId = null;
        alt.log(`Delivery failed for ${this.player.id}`);
        this.setState(DeliveryState.EMPTY);  //'empty'			нет активного заказа (провален или выполнен)
    }

    async handleDamage(vehicle, attacker) {
        //если авто получило урон, но игрок не едет к точке разгрузки или если урон уже обрабатывается (по идее проверка на state не нужна так как раньше была проверка на loadedVehId)
        if (this.state !== DeliveryState.DELIVERING || this.damageHandlingInProgress) return;
        this.damageHandlingInProgress = true;   // что бы повтоно не вызывались проверки если авто еще не успело удалиться
        
        try {
            await this.cargo.onDamage(vehicle, attacker, this);
        } finally { // после завершения обработки урона ставит this.damageHandlingInProgress = false;
            this.damageHandlingInProgress = false;
        }
    }
}
