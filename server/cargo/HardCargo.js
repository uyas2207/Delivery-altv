//для работы функицй alt.
import * as alt from 'alt-server';
//Берется базовая логика типа груза из shared\cargo /CargoBase.js
import CargoBase from './CargoBase.js';

export class HardCargo extends CargoBase {
    constructor() {
        super('Hard', 2000, 'Вы уничтожили груз');  //type, reward, reason
        this.destroyInProgress = false; //для проверки началась ли обработка урона (что бы не было случаев что урон несколько раз обработался за 0,5 секунды и программа будент пытаться несколько раз удалить автомобиль)
    }

    async onDamage(vehicle, attacker, deliveryJob) {
        if (!vehicle.valid) return false;   // урон не обработан
        if (this.destroyInProgress) return true; // урон обработан

        alt.log(`HardCargo авто получило урон после проверок`);
        this.destroyInProgress = true;

        try {
            await new Promise(resolve => alt.setTimeout(resolve, 500));
                vehicle.destroy();
                deliveryJob.fail(attacker);
        }
        finally {   //в конце поставится this.destroyInProgress = false; и можно будет снова обрабатывать урон при следующем заказе
            this.destroyInProgress = false;
            alt.log('finally HardCargo');
        }
        
        return true;    // урон обработан
    }
}