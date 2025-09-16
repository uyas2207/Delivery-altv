// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';

import * as fs from 'fs';
import * as path from 'path';


console.log('==> Your Resource Has Loaded! Horray!');


// Called on Server-side
alt.on('playerConnect', (player) => {
    // Logs to the console.
    alt.log(`==> ${player.name} has connected.`);

    // Displays message to all players.
    chat.broadcast(`==> ${player.name} has joined.`);

    // Sets the player's model.
    player.model = 'mp_m_freemode_01';

    // Spawns the player at coordinates x, y, z.
    player.spawn(813, -279, 66);

    // Emit to the player passed, the event name, the argument to send.
    alt.emitClient(player, 'Server:Log', 'hello', 'world'); 
});

alt.on('playerConnect', (player) => {
    alt.emitClient(player, 'drawNotification', 'Игрок подключился к серверу!');
});

chat.registerCmd("randomload", (player) => {
        // Отправляем команду на клиент для вызова функции
        alt.emitClient(player, 'client:delivery');
        chat.send(player, "Случайная точка погрузки выбрана");
});

class ConfigManager {
    constructor() {
        this.loadingPoints = [];
        this.unloadingPoints = [];
        this.policeStations = [];
        this.allowedVehicles = [];
    }

    loadConfig() {
            const configPath = path.join(process.cwd(), 'resources', 'delivery', 'config', 'config.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            const fullConfig = JSON.parse(configData);
            // Разделение конфига на отдельные части
            this.loadingPoints = fullConfig.points?.loading || [];
            this.unloadingPoints = fullConfig.points?.unloading || [];
            this.policeStations = fullConfig.policeStations || [];
            this.allowedVehicles = fullConfig.transport?.allowedVehicles || [];
    }

    getLoadingPoints(player) {
        if (this.loadingPoints.length > 0) {
        alt.emitClient(player, 'initLoadingPoints', this.loadingPoints);
        }
    }

    getUnloadingPoints(player) {
        if (this.unloadingPoints.length > 0) {
        alt.emitClient(player, 'initUnloadingPoints', this.unloadingPoints);
        }
    }

    getPoliceStations(player) {
        if (this.policeStations.length > 0) {
        alt.emitClient(player, 'initPoliceStations', this.policeStations);
        }
    }

    getAllowedVehicles(player) {
        if (this.allowedVehicles.length > 0) {
        alt.emitClient(player, 'initAllowedVehicles', this.allowedVehicles);
        }
    }
}

class DeliveryJob {
    constructor() {
        this.configManager = new ConfigManager();
        this.loadtype = null; 
        this.loadedvehid = null;
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

        alt.onClient('client:setLoadedVehicle', (player, loadtype, loadedvehid) => {
            this.loadtype = loadtype;
            this.loadedvehid = loadedvehid;
         alt.log(`Отслеживается груз типа ${this.loadtype}, loadedvehid ${this.loadedvehid}`);
        });


    alt.on('vehicleDamage', (vehicle, attacker) => {
    if ((!vehicle || !vehicle.valid) || (vehicle.id !== this.loadedvehid)) return;
    if (!['Hard', 'Danger'].includes(this.loadtype)) return;
    
    if (attacker instanceof alt.Player && attacker.valid) {
    switch (this.loadtype) {
        case 'Danger':
            alt.emitClient(attacker, 'explode');
            alt.setTimeout(() => {
                if (vehicle.valid) {
                    vehicle.destroy();
                    alt.log(`Транспорт Danger уничтожен из-за повреждений`);
                    this.setLoadedVehicleNull(attacker);
                }
            }, 500);
            alt.emitClient(attacker, 'drawNotification', 'Вы взорвали груз');
            alt.emitClient(attacker, 'drawNotification', 'Заказ отменен!');
            break;

        case 'Hard':
            if (vehicle.valid) {
                alt.setTimeout(() => {
                    vehicle.destroy();
                    alt.log(`Транспорт Hard уничтожен из-за повреждений`);
                alt.emitClient(attacker, 'drawNotification', 'Вы уничтожили груз');
                alt.emitClient(attacker, 'drawNotification', 'Заказ отменен!');
                this.setLoadedVehicleNull(attacker);
                }, 500);
            }
            break;
    }
    }
});
    }
    setLoadedVehicleNull(attacker) {
        alt.emitClient(attacker,'client:clearLoadedVehicle')
        this.loadtype = null;
        this.loadedvehid = null;
    }
}

 new DeliveryJob();