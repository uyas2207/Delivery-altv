// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';
//для работы с файлами
import * as fs from 'fs';       
//для работы с путями файлов
import * as path from 'path';

console.log('==> Your Resource Has Loaded! Horray!');


chat.registerCmd("randomload", (player) => {
        // Отправляем команду на клиент для старта новой погрузки (удаляя текущий заказ)
        alt.emitClient(player, 'client:delivery');
        chat.send(player, "Случайная точка погрузки выбрана");
});
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
//логика для работы доставки
class DeliveryJob {
    constructor() {
        this.configManager = new ConfigManager();
        this.loadtype = null; 
        this.loadedvehid = null;
        this.init();
    }

    init() {
        //при старте сервера начинает читать данные из конфига
        this.configManager.loadConfig();
        //при входе игрока отправляет ему данные из конфига
        alt.on('playerConnect', (player) => {
            this.configManager.getLoadingPoints(player);
            this.configManager.getUnloadingPoints(player);
            this.configManager.getPoliceStations(player);
            this.configManager.getAllowedVehicles(player);
        });
        //получение информации (тип груза и сетевой id загруженного авто) после загрузки автомобиля на клиенте
        alt.onClient('client:setLoadedVehicle', (player, loadtype, loadedvehid) => {
            this.loadtype = loadtype;
            this.loadedvehid = loadedvehid;
         alt.log(`Отслеживается груз типа ${this.loadtype}, loadedvehid ${this.loadedvehid}`);
        });

//логика при получении урона (для hard и danger типов груза)
alt.on('vehicleDamage', (vehicle, attacker) => {
    if (!['Hard', 'Danger'].includes(this.loadtype)) return;    //если машина получила урон, но она не загружена hard или danger ничего не делать
    if ((!vehicle || !vehicle.valid) || (vehicle.id !== this.loadedvehid)) return;  //если машина получила урон, но у нее не стевой id загруженной машины ничего не делать 
    
    if (attacker instanceof alt.Player && attacker.valid) {
    switch (this.loadtype) {//если машина получила урон и она загружена hard или danger
        case 'Danger':
            alt.emitClient(attacker, 'explode');    // визуальный взрыв на клиенте
            alt.setTimeout(() => {  //машина пропадет после 0,5 секнд от взырва
                if (vehicle.valid) {
                    vehicle.destroy();
                    alt.log(`Транспорт Danger уничтожен из-за повреждений`);
                    this.setLoadedVehicleNull(attacker);    //обнуляется информация о сетвеом id и типе груза + отменяется заказ на клиенте
                }
            }, 500);
            alt.emitClient(attacker, 'drawNotification', 'Вы взорвали груз');
            alt.emitClient(attacker, 'drawNotification', 'Заказ отменен!');
            break;

        case 'Hard':
            if (vehicle.valid) {
                alt.setTimeout(() => {  //машина пропадет после 0,5 после столкновения
                    vehicle.destroy();
                    alt.log(`Транспорт Hard уничтожен из-за повреждений`);
                alt.emitClient(attacker, 'drawNotification', 'Вы уничтожили груз');
                alt.emitClient(attacker, 'drawNotification', 'Заказ отменен!');
                this.setLoadedVehicleNull(attacker);    //обнуляется информация о сетвеом id и типе груза + отменяется заказ на клиенте
                }, 500);
            }
            break;
    }
    }
});
    }
    setLoadedVehicleNull(attacker) {
        alt.emitClient(attacker,'client:clearLoadedVehicle')    //обнуление всей информации о грузе и машине на клиенте + отмена заказа
        //обнуляется информация о сетвеом id и типе груза на сервере
        this.loadtype = null;
        this.loadedvehid = null;
    }
}

new DeliveryJob();