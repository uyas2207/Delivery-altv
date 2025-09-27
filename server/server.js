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
        return false;
    }

    onSuccessfulDelivery(player) {
        chat.send(player, `+${this.reward}\\$`);
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
            alt.setTimeout(() => {
                vehicle.destroy();
                chat.send(attacker, 'Вы уничтожили груз, заказ отменен!');
                deliveryJob.cancelOrder(attacker);
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
        alt.emitClient(attacker, 'explode');
        alt.setTimeout(() => {
            if (vehicle.valid) {
                vehicle.destroy();
            }
            chat.send(attacker, 'Вы взорвали груз, заказ отменен!');
            deliveryJob.cancelOrder(attacker);
        }, 500);
        return true;
    }
}

class IllegalCargo extends CargoBase {
    constructor() {
        super('Illegal', 1500);
    }

    onPoliceZoneEnter(player, deliveryJob) {
        chat.send(player, 'Вы находились слишком близко к полицейскому участку, заказ отменен!');
        deliveryJob.cancelOrder(player);
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
// Основной общий класс системы доставки
class DeliveryJobSystem {
    constructor() {  
        this.configManager = new ConfigManager();
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

        alt.onClient('client:startLoading', (player, vehicleId) => {
            this.startLoading(player, vehicleId);
        });

        alt.on('vehicleDamage', (vehicle, attacker) => {
            //захардкоженная проверка на Hard и Danger убрать в случае добавления логики на получение урона у новых типов груза
         //   if (!['Hard', 'Danger'].includes(this.loadtype)) return;    //если машина получила урон, но она не загружена hard или danger ничего не делать
            if ((!vehicle || !vehicle.valid) || (vehicle.id !== this.loadedvehid)) return;  //если машина получила урон, но у нее не стевой id загруженной машины ничего не делать 
            this.handleVehicleDamage(vehicle, attacker);
        });

        chat.registerCmd("randomload", (player) => {
                    this.startNewOrder(player);
        });
    }

    startNewOrder(player) {
        // Отменяем текущий заказ если есть
      /*  if (this.activeOrders.has(player.id)) {
            this.cancelOrder(player);
        }
*/
        const order = new DeliveryJob(player, this.configManager);
    //    this.activeOrders.set(player.id, order);
        order.start();
        
        chat.send(player, "Случайная точка погрузки выбрана");
    }    

    handleVehicleDamage(vehicle, attacker) {
            if (!(attacker instanceof alt.Player) || !attacker.valid) return;
    
            const order = this.activeOrders.get(attacker.id);
            if (order && order.vehicleId === vehicle.id) {
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
        this.vehicleId = null;
        this.cargoTypes = [CommonCargo, HardCargo, DangerCargo, IllegalCargo];      //все типы заказа
        this.state = 'empty';                                                       // empty, loading, delivering, completed, cancelled
    }

    start() {
            const CargoClass = this.cargoTypes[Math.floor(Math.random() * this.cargoTypes.length)];
            this.cargo = new CargoClass();
            alt.log(`Выбран тип груза: ${this.cargo.type}`);
            alt.emitClient(this.player, 'client:startDelivery', this.cargo.type);
        }

    startLoading(vehicleId) {
        this.vehicleId = vehicleId;
        this.state = 'loading';
    }

    complete() {
        this.state = 'completed';
        this.cargo.onSuccessfulDelivery(this.player);
    }

    cancel() {
        this.state = 'cancelled';
        alt.emitClient(this.player, 'client:cancelDelivery');
    }

    handleDamage(vehicle, attacker) {
        if (this.state === 'delivering') {
            this.cargo.onDamage(vehicle, attacker, this);
        }
    }

}

//new DeliveryJob();
new DeliveryJobSystem();