//для работы функицй alt.
import * as alt from 'alt-server';

class CargoBase {
    constructor(type, reward, reason) {
        this.type = type;
        this.reward = reward;
        this.reason = reason;
    }

    async onDamage(vehicle, attacker, deliveryJob) {
        // базовая логика - без обработки урона
        
        alt.log(`CargoBase авто получило урон после проверок`);
        return false;   //урон не обработан
    }
    //общая логика для успешного завершения
    onSuccessfulDelivery(player) {
        alt.emitClient(player, 'drawNotification', `+${this.reward}\$`);
    }
    //общая логика для провала
    onDeliveryFailed(player) {
        alt.emitClient(player, 'drawNotification',`${this.reason}`);
        alt.emitClient(player, 'drawNotification','заказ отменен!');
    }
}
//передается CargoBase для файлов которые будут использовать import CargoBase from './CargoBase.js'
export default CargoBase; // default export