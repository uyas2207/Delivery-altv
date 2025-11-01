//Берется базовая логика типа груза из shared\cargo /CargoBase.js
import CargoBase from './CargoBase.js';

export class CommonCargo extends CargoBase {   
    constructor() {
        super('Common', 1000, null);    //type, reward, reason
    }
}