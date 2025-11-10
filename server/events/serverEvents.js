import * as alt from 'alt-server';
import * as chat from 'alt:chat';

export class ServerEvents {
    static setupSystemEvents(deliverySystem) {
        //отправляет конфиг игроку после входа
        alt.on('playerConnect', (player) => {
            deliverySystem.configManager.sendConfigToPlayer(player);
            chat.send(player, "{80eb34}Press {ff0000}T {80eb34}and type {ff0000}/randomload {80eb34}to start delivery.");
            player.spawn(-1271.63, -1430.71, 4.34);
        });
        //когда клиент загрузил автомобиль приходит ивент с клиента
        alt.onClient('client:startLoading', (player, loadedVehId) => {  
            deliverySystem.startLoading(player, loadedVehId); 
        });
        //если с клиента приходит информация что игрок завершил доставку успешно
        alt.onClient('client:completeDelivery', (player) => {
            deliverySystem.completeDelivery(player);
        });
        //если с клиента приходит информация что игрок провалил доставку 
        alt.onClient('client:failDelivery', (player) => {
            deliverySystem.failDelivery(player);
        });
        
        alt.on('vehicleDamage', (vehicle, attacker) => {
            alt.log(`авто получило урон перед проверками`);
            deliverySystem.handleVehicleDamage(vehicle, attacker);
        });
    }
}