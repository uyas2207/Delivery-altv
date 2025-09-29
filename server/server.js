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

class CargoBase {
    constructor(type, reward) {
        this.type = type;
        this.reward = reward;
    }

    onDamage(vehicle, attacker, deliveryJob) {
        // Базовая логика - без обработки урона
        
        alt.log(`CargoBase авто получило урон после проверок`);
        return false;
    }

    onSuccessfulDelivery(player) {
        alt.emitClient(player, 'drawNotification', `+${this.reward}\\$`);
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
    }

    onDamage(vehicle, attacker, deliveryJob) {
        if (vehicle.valid) {    
        alt.log(`HardCargo авто получило урон после проверок`);
            alt.setTimeout(() => {
                vehicle.destroy();
                alt.emitClient(attacker, 'drawNotification', 'Вы уничтожили груз, заказ отменен!');
                deliveryJob.cancel(attacker);
            }, 500);
        }
        return true;
    }
}

class DangerCargo extends CargoBase {
    constructor() {
        super('Danger', 3000);
    }

    onDamage(vehicle, attacker, deliveryJob) {
        alt.log(`DangerCargo авто получило урон после проверок`);
        alt.emitClient(attacker, 'explode');
        alt.setTimeout(() => {
            if (vehicle.valid) {
                vehicle.destroy();
            }
            alt.emitClient(attacker, 'drawNotification', 'Вы уничтожили груз, заказ отменен!');
            deliveryJob.cancel(attacker);
        }, 500);
        return true;
    }
}

class IllegalCargo extends CargoBase {
    constructor() {
        super('Illegal', 1500);
    }

    onPoliceZoneEnter(player, deliveryJob) {
        alt.emitClient(player, 'drawNotification', 'Вы находились слишком близко к полицейскому участку, заказ отменен!');
        deliveryJob.cancel(player);
        return true;
    }
}

//для работы с данными из конфига
class ConfigManager {
    constructor() {
        this.loadingPoints = [];
        this.unloadingPoints = [];
        this.policeStations = [];
        this.allowedVehicles = [];
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
    }
//оптравляет данные из конфига на клиент
    getLoadingPoints(player) {
        if (this.loadingPoints.length > 0) {
        alt.emitClient(player, 'initLoadingPoints', this.loadingPoints);
        }
    }
//оптравляет данные из конфига на клиент
    getUnloadingPoints(player) {
        if (this.unloadingPoints.length > 0) {
        alt.emitClient(player, 'initUnloadingPoints', this.unloadingPoints);
        }
    }
//оптравляет данные из конфига на клиент
    getPoliceStations(player) {
        if (this.policeStations.length > 0) {
        alt.emitClient(player, 'initPoliceStations', this.policeStations);
        }
    }
//оптравляет данные из конфига на клиент
    getAllowedVehicles(player) {
        if (this.allowedVehicles.length > 0) {
        alt.emitClient(player, 'initAllowedVehicles', this.allowedVehicles);
        }
    }
}
//общий, основной класс системы доставки
class DeliveryJobSystem {
    constructor() {  
        this.configManager = new ConfigManager();
        this.activeOrders = new Map();
        this.init();
    }

    init() {
        this.configManager.loadConfig();

        alt.on('playerConnect', (player) => {
                    this.configManager.getLoadingPoints(player);
                    this.configManager.getUnloadingPoints(player);
                    this.configManager.getPoliceStations(player);
                    this.configManager.getAllowedVehicles(player);
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
          //  alt.log(`авто получило урон до проверок`);
            //захардкоженная проверка на Hard и Danger поменять в случае добавления логики на получение урона у новых типов груза
         //   if (!['Hard', 'Danger'].includes(this.loadtype)) return;    //если машина получила урон, но она не загружена hard или danger ничего не делать
            if (!vehicle || !vehicle.valid) return;  
            if (!(attacker instanceof alt.Player) || !attacker.valid) return;
            alt.log(`Просто получение урона, авто получило урон после проверок`);
            this.handleVehicleDamage(vehicle, attacker);
        });

        chat.registerCmd("randomload", (player) => {
            this.startNewOrder(player);
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
            
            alt.log(`this.activeOrders(player.id) До: ${this.activeOrders(player.id)}`);
            this.activeOrders.delete(player.id);
            alt.log(`this.activeOrders(player.id): ${this.activeOrders(player.id)}`);
        }
    }

    failDelivery(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.fail(); // Делегируем логику провала конкретному заказу
        }
    }
/*
    //Для работы команды cancelorder
    cancelOrder(player) {
        const order = this.activeOrders.get(player.id);
        if (order) {
            order.cancel();
            this.activeOrders.delete(player.id);
        }
    }
*/
    startNewOrder(player) {
        // Отменяем текущий заказ если есть
        /*
        if (this.activeOrders.has(player.id)) {
            this.cancelOrder(player);
        }
*/
        const order = new DeliveryJob(player, this.configManager);
        this.activeOrders.set(player.id, order);
        order.start();
        
        alt.log("Случайная точка погрузки выбрана");
    }    

    handleVehicleDamage(vehicle, attacker) {
        const order = this.activeOrders.get(attacker.id);
        if (order && order.loadedVehId === vehicle.id) {
            alt.log(`авто получило урон после проверок на активный заказ`);
            alt.log(`order.loadedVehId: ${ order.loadedVehId}`);
            order.handleDamage(vehicle, attacker);
        }
    }

}
// Конкретный личный заказ доставки
class DeliveryJob {
    constructor(player, configManager) {
        this.player = player;
        this.configManager = configManager;
        this.cargo = null;                                                          // текущий тип заказа
        this.loadedVehId = null;
        this.cargoTypes = [IllegalCargo];      //все типы заказа CommonCargo, HardCargo, DangerCargo, IllegalCargo
        this.state = 'empty';                 // empty, loading, delivering, completed, cancelled
    }

    start() {
            const CargoClass = this.cargoTypes[Math.floor(Math.random() * this.cargoTypes.length)];
            this.cargo = new CargoClass();
            alt.log(`Выбран тип груза: ${this.cargo.type}`);
            alt.emitClient(this.player, 'client:startDelivery', this.cargo.type);
        }

    Loaded(loadedVehId) {
        this.loadedVehId = loadedVehId;
        this.state = 'delivering';
    }

    complete() {
        this.state = 'completed';
        this.cargo.onSuccessfulDelivery(this.player);
    }

    cancel() {
        this.state = 'empty';
        alt.emitClient(this.player, 'client:cancelDelivery');
    }

    fail() {
        if (this.state === 'delivering' && this.cargo instanceof IllegalCargo) {
            // Вызываем метод конкретного типа груза для обработки провала
            this.cargo.onPoliceZoneEnter(this.player, this);
        } else {
            alt.log(`Попытка провала доставки в неправильном состоянии или для неправильного груза`);
        }
    }

    handleDamage(vehicle, attacker) {
        if (this.state === 'delivering') {
            this.cargo.onDamage(vehicle, attacker, this);
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