// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';
//для работы с файлами
import * as fs from 'fs';       
//для работы с путями файлов
import * as path from 'path';
//добавление логики каждого типа груза из папки shared\cargo
import { CommonCargo } from '../shared/cargo/CommonCargo.js';
import { DangerCargo } from '../shared/cargo/DangerCargo.js';
import { HardCargo } from '../shared/cargo/HardCargo.js';
import { IllegalCargo } from '../shared/cargo/IllegalCargo.js';
import { DeliveryState } from '../shared/Consts.js';

//для работы с данными из конфига
class ConfigManager {
    constructor() {
        this.loadingPoints = [];
        this.unloadingPoints = [];
        this.policeStations = [];
        this.allowedVehicles = [];
        this.cargoTypes = [CommonCargo, HardCargo, DangerCargo, IllegalCargo];
        this.deliveryState = DeliveryState;
    }
//получение данных из конфига
    loadConfig() {
            const configPath = path.join(process.cwd(), 'resources', 'delivery', 'config', 'config.json');  //путь до конфига
            const configData = fs.readFileSync(configPath, 'utf8');
            const fullConfig = JSON.parse(configData);  //получение всех данных из конфига
            // Разделение конфига на отдельные части
            this.loadingPoints = fullConfig.points?.loading || [];
            this.unloadingPoints = fullConfig.points?.unloading || [];
            this.policeStations = fullConfig.policeStations || [];
            this.allowedVehicles = fullConfig.transport?.allowedVehicles || [];

            alt.log(`Config loaded: ${this.loadingPoints.length} loading, ${this.unloadingPoints.length} unloading points`);
    }

    getCargoTypes() {
        return this.cargoTypes;
    }
//оптравляет данные из конфига на клиент
    sendConfigToPlayer(player) {
        if (this.loadingPoints.length > 0) {
            alt.emitClient(player, 'initLoadingPoints', this.loadingPoints);
        }
        if (this.unloadingPoints.length > 0) {
            alt.emitClient(player, 'initUnloadingPoints', this.unloadingPoints);
        }
        if (this.policeStations.length > 0) {
            alt.emitClient(player, 'initPoliceStations', this.policeStations);
        }
        if (this.allowedVehicles.length > 0) {
            alt.emitClient(player, 'initAllowedVehicles', this.allowedVehicles);
        }
        // отправляет deliveryState на клиент (берется из Consts.js)
        alt.emitClient(player, 'initDeliveryState', this.deliveryState);
    }
}

//общий, основной класс системы доставки
class DeliveryJobSystem {
    constructor() {  
        this.configManager = new ConfigManager();
        this.activeOrders = new Map();  // хранит активные заказы по ID игроков
        this.DeliveryState = DeliveryState; // сохраняем DeliveryState для использования в классе
        this.init();
    }

    init() {
        //получение данных из конфига
        this.configManager.loadConfig();
        //отправляет конфиг игроку после входа
        alt.on('playerConnect', (player) => {
            this.configManager.sendConfigToPlayer(player);
            chat.send(player, "{80eb34}Press {ff0000}T {80eb34}and type {ff0000}/randomload {80eb34}to start delivery.");
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

        const order = new DeliveryJob(player, this.configManager, this.DeliveryState);
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
            alt.log(`order.loadedVehId: ${ order.loadedVehId}`);
            await order.handleDamage(vehicle, attacker);
        }
    }

}

// Конкретный личный заказ доставки
class DeliveryJob {
    constructor(player, configManager, DeliveryState) {
        this.player = player;   //id игрока которой выполняет доставку
        this.configManager = configManager; 
        this.DeliveryState = DeliveryState;
        this.cargo = null;          // текущий тип заказа
        this.loadedVehId = null;    //id загруженнного автомобился
        this.cargoTypes = this.configManager.getCargoTypes();  // Получаем типы грузов из configManager
        this.state = this.DeliveryState.EMPTY;                 // empty, loading, delivering, completed, cancelled
        this.damageHandlingInProgress = false; // для единоразовой обработки урона
    }

    start() {
            const CargoClass = this.cargoTypes[Math.floor(Math.random() * this.cargoTypes.length)];
            this.cargo = new CargoClass();
            this.state = this.DeliveryState.ACTIVE; //показывает что заказ только что начался

            alt.log(`Выбран тип груза: ${this.cargo.type}`);
            alt.emitClient(this.player, 'client:startDelivery', this.cargo.type);
        }
//запоминает loadedVehId
    Loaded(loadedVehId) {
        this.loadedVehId = loadedVehId;
        this.state = this.DeliveryState.DELIVERING;  //автомобиль был загружен и едет до точки разгрузки, для проверок урона
        alt.log(`Loaded vehicle: ${loadedVehId}`);
    }
// выдает награду
    complete() {
        this.state = this.DeliveryState.COMPLETED;   // пока что не используется, но для дебага и для возможных расширений в коде
        this.cargo.onSuccessfulDelivery(this.player);   // выдает награду
        this.loadedVehId = null;
        alt.log(`Delivery completed for ${this.player.id}`);
    }
// отменяет текущий заказ
    cancel() {
        this.state = this.DeliveryState.CANCELLED;   // пока что не используется, но для дебага и для возможных расширений в коде
        alt.emitClient(this.player, 'client:cancelDelivery');
        this.loadedVehId = null;
        alt.log(`Delivery cancelled for ${this.player.id}`);
    }
// отменяет текущий заказ + отправляет уведомление с причиной провала
    fail() {
        this.state = this.DeliveryState.FAILED;  // пока что не используется, но для дебага и для возможных расширений в коде
        this.cargo.onDeliveryFailed(this.player);
        alt.emitClient(this.player, 'client:cancelDelivery');
        this.loadedVehId = null;
        alt.log(`Delivery failed for ${this.player.id}`);
    }

    async handleDamage(vehicle, attacker) {
        //если авто получило урон, но игрок не едет к точке разгрузки или если урон уже обрабатывается (по идее проверка на state не нужна так как раньше была проверка на loadedVehId)
        if (this.state !== this.DeliveryState.DELIVERING || this.damageHandlingInProgress) return;
        this.damageHandlingInProgress = true;   // что быв повтоно не вызывались проверки если авто еще н6е успело удалиться
        
        try {
            await this.cargo.onDamage(vehicle, attacker, this);
        } finally { // после завершения обработки урона ставит this.damageHandlingInProgress = false;
            this.damageHandlingInProgress = false;
        }
    }

}

//new DeliveryJob();
new DeliveryJobSystem();
