// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';


import {ConfigManager } from './classes/ConfigManager.js';
import {DeliveryJob } from './classes/DeliveryJob.js';

//общий, основной класс системы доставки
class DeliveryJobSystem {
    constructor() {  
        this.configManager = new ConfigManager();
        this.activeOrders = new Map();  // хранит активные заказы по ID игроков
        this.init();
    }

    init() {
        //получение данных из конфига
        this.configManager.loadConfig();
        //отправляет конфиг игроку после входа
        alt.on('playerConnect', (player) => {
            this.configManager.sendConfigToPlayer(player);
            chat.send(player, "{80eb34}Press {ff0000}T {80eb34}and type {ff0000}/randomload {80eb34}to start delivery.");
            player.spawn(-1271.63, -1430.71, 4.34);
        });
        //когда клиент загрузил автомобиль приходит ивент с клиента
        alt.onClient('client:startLoading', (player, loadedVehId) => {  
            this.startLoading(player, loadedVehId); 
        });
        //если с клиента приходит информация что игрок завершил доставку успешно
        alt.onClient('client:completeDelivery', (player) => {
            this.completeDelivery(player);
        });
        //если с клиента приходит информация что игрок провалил доставку 
        alt.onClient('client:failDelivery', (player) => {
            this.failDelivery(player);
        });
        
        alt.on('vehicleDamage', (vehicle, attacker) => {
            alt.log(`авто получило урон перед проверками`);
            this.handleVehicleDamage(vehicle, attacker);
        });

        //единственный способ начать доставку /randomload
        chat.registerCmd("randomload", (player) => {
            this.startNewOrder(player);
        });
        chat.registerCmd("cancelorder", (player) => {
            this.cancelOrder(player);
        });
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

//new DeliveryJob();
new DeliveryJobSystem();
