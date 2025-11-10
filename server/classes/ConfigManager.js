import * as alt from 'alt-server';
//для работы с файлами
import * as fs from 'fs';       
//для работы с путями файлов
import * as path from 'path';

import { CommonCargo } from './cargo/CommonCargo.js';
import { DangerCargo } from './cargo/DangerCargo.js';
import { HardCargo } from './cargo/HardCargo.js';
import { IllegalCargo } from './cargo/IllegalCargo.js';

//для работы с данными из конфига
export class ConfigManager {
    constructor() {
        this.loadingPoints = [];
        this.unloadingPoints = [];
        this.policeStations = [];
        this.allowedVehicles = [];
       
        this.cargoTypes = [CommonCargo, HardCargo, DangerCargo, IllegalCargo];
        //this.deliveryState = DeliveryState;
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
        //alt.emitClient(player, 'initDeliveryState', this.deliveryState);
    }
}