//для работы функицй alt.
//в этом файле такие функции не используются но вдруг в будущем будет добавлена еще логика и возникнет необходимость в altv функционале
import * as alt from 'alt-server';
//Берется базовая логика типа груза из shared\cargo /CargoBase.js
import CargoBase from './CargoBase.js';

export class IllegalCargo extends CargoBase {
    constructor() {
        super('Illegal', 1500, 'Вы находились слишком близко к полицейскому участку');  //type, reward, reason
    }
}