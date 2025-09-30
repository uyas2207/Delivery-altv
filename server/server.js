// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';
//для работы с файлами
import * as fs from 'fs';       
//для работы с путями файлов
import * as path from 'path';

/*
chat.registerCmd("randomload", (player) => {
        // Отправляем команду на клиент для старта новой погрузки (удаляя текущий заказ)
        alt.emitClient(player, 'client:startDelivery');
        chat.send(player, "Случайная точка погрузки выбрана");
});
*/

//Добавить первой стрской onDeliveryFailed Вывод уникальной ${reason}, вторая строчка у всех одинаковая 'заказ отменен!'
class CargoBase {
    constructor(type, reward) {
        this.type = type;
        this.reward = reward;
    }

    async onDamage(vehicle, attacker, deliveryJob) {
        // Базовая логика - без обработки урона
        
        alt.log(`CargoBase авто получило урон после проверок`);
        return false;   //урон не обработан
    }

    onSuccessfulDelivery(player) {
        alt.emitClient(player, 'drawNotification', `+${this.reward}\$`);
    }

    onDeliveryFailed(player) {
        alt.emitClient(player, 'drawNotification', `Доставка провалена:`);
    }
}

// Конкретные типы грузов
class CommonCargo extends CargoBase {
    constructor() {
        super('Common', 1000);
    }
}

class HardCargo extends CargoBase {
    constructor() {
        super('Hard', 2000);
        this.destroyInProgress = false;
    }

    async onDamage(vehicle, attacker, deliveryJob) {
        if (!vehicle.valid) return false;   // урон не обработан
        if (this.destroyInProgress === true) return true; // урон обработан

        alt.log(`HardCargo авто получило урон после проверок`);
        this.destroyInProgress = true;

        try {
            await new Promise(resolve => alt.setTimeout(resolve, 500));
                vehicle.destroy();
                deliveryJob.fail(attacker);
        }
        finally {
            this.destroyInProgress = false;
            alt.log('finally HardCargo');
        }
        
        return true;    // урон обработан
    }
/*
        if (vehicle.valid) {    
        alt.log(`HardCargo авто получило урон после проверок`);
            alt.setTimeout(() => {
                vehicle.destroy();
                deliveryJob.fail(attacker);
            }, 500);
        }
        return true;
        */

    onDeliveryFailed(player) {
        //alt.emitClient(player, 'drawNotification', `Опасный груз детонировал! Причина: ${reason}`);
        alt.emitClient(player, 'drawNotification', 'Вы уничтожили груз');
        alt.emitClient(player, 'drawNotification','заказ отменен!');
    }
}

class DangerCargo extends CargoBase {
    constructor() {
        super('Danger', 3000);
        this.destroyInProgress = false;
    }

   async onDamage(vehicle, attacker, deliveryJob) {
        if (!vehicle.valid) return false;   // урон не обработан
        if (this.destroyInProgress === true) return true; // урон обработан

        alt.log(`DangerCargo авто получило урон после проверок`);
        this.destroyInProgress = true;

        try {
            alt.emitClient(attacker, 'explode');
            await new Promise(resolve => alt.setTimeout(resolve, 500));
                vehicle.destroy();
                deliveryJob.fail(attacker);
        }
        finally {
            this.destroyInProgress = false;  
            alt.log('finally DangerCargo');
        }
        
        return true;    // урон обработан
    }
    /*
        alt.log(`DangerCargo авто получило урон после проверок`);
        alt.emitClient(attacker, 'explode');
        alt.setTimeout(() => {
            if (vehicle.valid) vehicle.destroy();
            deliveryJob.fail(attacker);
        }, 500);
        return true;
        */
    

    onDeliveryFailed(player) {
        alt.emitClient(player, 'drawNotification', `'Вы взорвали груз`);
        alt.emitClient(player, 'drawNotification','заказ отменен!');
    }
}

class IllegalCargo extends CargoBase {
    constructor() {
        super('Illegal', 1500);
    }
/*
    onPoliceZoneEnter(player, deliveryJob) {
        alt.emitClient(player, 'drawNotification', 'Вы находились слишком близко к полицейскому участку'); 
        alt.emitClient(player, 'drawNotification','заказ отменен!');
        deliveryJob.cancel(player);
        return true;
    }
    */
    onDeliveryFailed(player) {
        alt.emitClient(player, 'drawNotification', 'Вы находились слишком близко к полицейскому участку'); 
        alt.emitClient(player, 'drawNotification','заказ отменен!');
    }

}

//для работы с данными из конфига
class ConfigManager {
    constructor() {
        this.loadingPoints = [];
        this.unloadingPoints = [];
        this.policeStations = [];
        this.allowedVehicles = [];
        this.cargoTypes = [CommonCargo, HardCargo, DangerCargo, IllegalCargo];
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
    }
}

// Конкретный личный заказ доставки
class DeliveryJob {
    constructor(player, configManager) {
        this.player = player;
        this.configManager = configManager;
    //    this.configManager = configManager;
        this.cargo = null;                                                          // текущий тип заказа
        this.loadedVehId = null;
        this.cargoTypes = this.configManager.getCargoTypes();  // Получаем типы грузов из configManager
    //    this.cargoTypes = [CommonCargo, HardCargo, DangerCargo, IllegalCargo];      //все типы заказа CommonCargo, HardCargo, DangerCargo, IllegalCargo
        this.state = 'empty';                 // empty, loading, delivering, completed, cancelled
        this.damageHandlingInProgress = false; // для единоразовой обработки урона
    }

    start() {
            const CargoClass = this.cargoTypes[Math.floor(Math.random() * this.cargoTypes.length)];
            this.cargo = new CargoClass();
            this.state = 'active';

            alt.log(`Выбран тип груза: ${this.cargo.type}`);
            alt.emitClient(this.player, 'client:startDelivery', this.cargo.type);
        }

    Loaded(loadedVehId) {
        this.loadedVehId = loadedVehId;
        this.state = 'delivering';
        alt.log(`Loaded vehicle: ${loadedVehId}`);
    }

    complete() {
        this.state = 'completed';
        this.cargo.onSuccessfulDelivery(this.player);
        alt.log(`Delivery completed for ${this.player.id}`);
    }

    cancel() {
        this.state = 'cancelled';
        alt.emitClient(this.player, 'client:cancelDelivery');
        alt.log(`Delivery cancelled for ${this.player.id}`);
    }

    fail() {
        this.state = 'failed';
        this.cargo.onDeliveryFailed(this.player);
        alt.emitClient(this.player, 'client:cancelDelivery');
        alt.log(`Delivery failed for ${this.player.id}`);
        /*
        if (this.state === 'delivering' && this.cargo instanceof IllegalCargo) {
            // Вызываем метод конкретного типа груза для обработки провала
            this.cargo.onPoliceZoneEnter(this.player, this);
        } else {
            alt.log(`Попытка провала доставки в неправильном состоянии или для неправильного груза`);
        }
            */
    }

    async handleDamage(vehicle, attacker) {
        if (this.state !== 'delivering' || this.damageHandlingInProgress) return;
        this.damageHandlingInProgress = true;
        
        try {
            await this.cargo.onDamage(vehicle, attacker, this);
        } finally {
            this.damageHandlingInProgress = false;
            alt.log('finally handleDamage');
        }        
        /*
        if (this.state === 'delivering') {
            this.cargo.onDamage(vehicle, attacker, this);
        }
        */
    }

}

class DeliveryJobFactory {
    constructor(configManager) {
        this.configManager = configManager;
    }

    createDeliveryJob(player) {
        const cargoTypes = this.configManager.getCargoTypes();
        return new DeliveryJob(player, cargoTypes);
    }
}


//общий, основной класс системы доставки
class DeliveryJobSystem {
    constructor() {  
        this.configManager = new ConfigManager();
        this.jobFactory = new DeliveryJobFactory(this.configManager);
        this.activeOrders = new Map();
        this.init();
    }

    init() {
        this.configManager.loadConfig();

        alt.on('playerConnect', (player) => {
            this.configManager.sendConfigToPlayer(player);
        });

        alt.onClient('client:startLoading', (player, loadedVehId) => {
            // сделано для инкапсуляции, что бы не пришлось менять обработчик событий при изменении/добавлении функционала 
            this.startLoading(player, loadedVehId);
        });

        alt.onClient('client:completeDelivery', (player) => {
            this.completeDelivery(player);
        });

        alt.onClient('client:failDelivery', (player) => {
            this.failDelivery(player);
        });

        alt.on('vehicleDamage', (vehicle, attacker) => {
            alt.log(`Просто получение урона, авто получило урон после проверок`);
            this.handleVehicleDamage(vehicle, attacker);
        });

        chat.registerCmd("randomload", (player) => {
            this.startNewOrder(player);
        });

        chat.registerCmd("cancelorder", (player) => {
            this.cancelOrder(player);
        });
    }

    startLoading(player, loadedVehId) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.Loaded(loadedVehId);
        }
    }

    completeDelivery(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.complete();
            
            this.activeOrders.delete(player.id);
        }
    }

    failDelivery(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.fail(); // Делегируем логику провала конкретному заказу
        }
    }

    //Для работы команды cancelorder
    cancelOrder(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.cancel();
            this.activeOrders.delete(player.id);
        }
    }

    startNewOrder(player) {
        // Отменяем текущий заказ если есть
        if (this.activeOrders.has(player.id)) {
            this.cancelOrder(player);
        }

        const order = new DeliveryJob(player, this.configManager);
        this.activeOrders.set(player.id, order);
        order.start();
        
        alt.log("Случайная точка погрузки выбрана");
    }    

    async handleVehicleDamage(vehicle, attacker) {
        if (!vehicle?.valid || !(attacker instanceof alt.Player) || !attacker.valid) return;

        const order = this.activeOrders.get(attacker.id);
        if (order && order.loadedVehId === vehicle.id) {
            alt.log(`авто получило урон после проверок на активный заказ`);
            alt.log(`order.loadedVehId: ${ order.loadedVehId}`);
            await order.handleDamage(vehicle, attacker);
        }
    }

}
//new DeliveryJob();
new DeliveryJobSystem();

/*
this.state = 'delivering';
this.state === 'waiting_for_loading'
this.state = 'completed';
this.state = 'empty';
*/