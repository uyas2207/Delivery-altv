// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';

import { ServerEvents } from './events/ServerEvents.js';
import { ConfigManager } from './classes/ConfigManager.js';
import { DeliveryJob } from './classes/DeliveryJob.js';
import { DeliveryCommands } from './commands/deliveryCommands.js';

//общий, основной класс системы доставки
class DeliveryJobSystem {
    constructor() {  
        this.configManager = new ConfigManager();
        this.activeOrders = new Map();  // хранит активные заказы по ID игроков
        this.configManager.loadConfig();
    }

    startNewOrder(player) {
        // отменяем текущий заказ если есть
        if (this.activeOrders.has(player.id)) {
            this.cancelOrder(player);
        }

        const order = new DeliveryJob(player, this.configManager);
        this.activeOrders.set(player.id, order);
        order.start();  // делегирует логику конкретному заказу
    }     

    startLoading(player, loadedVehId) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.Loaded(loadedVehId);  // делегирует логику конкретному заказу
        }
    }

    completeDelivery(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.complete();   // делегирует логику конкретному заказу
            
            this.activeOrders.delete(player.id);
        }
    }

    failDelivery(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.fail(); // делегирует логику конкретному заказу
        }
    }

    cancelOrder(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.cancel(); // делегирует логику конкретному заказу
            this.activeOrders.delete(player.id);       
        }
    }   

    async handleVehicleDamage(vehicle, attacker) {
        if (!vehicle?.valid || !(attacker instanceof alt.Player) || !attacker.valid) return;

        const order = this.activeOrders.get(attacker.id);
        if (order && order.loadedVehId === vehicle.id) {    //проверка что урон был получеен машиной в которую погружен заказ
            alt.log(`авто получило урон после проверок на загруженный автомобиль`);
            await order.handleDamage(vehicle, attacker);
        }
    }
}

const deliverySystem = new DeliveryJobSystem();
ServerEvents.setupSystemEvents(deliverySystem);
DeliveryCommands.register(deliverySystem);