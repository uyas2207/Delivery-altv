import * as alt from 'alt-client';

// Блокировщик транспорта
export class VehicleBlocker {
    async blockVehicleForThreeSeconds(vehicle) {
        return new Promise((resolve) => {    
            if (vehicle && vehicle.valid) {
                vehicle.frozen = true;
                 setTimeout(() => {
                    vehicle.frozen = false;
                    resolve();
                }, 3000);
            } else {
                resolve(); // если транспорт невалиден, сразу разрешает промис
                alt.log('Ошибка, неправильный reslove')
            }
        });

    }
}
//export default VehicleBlocker;