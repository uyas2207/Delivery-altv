// <reference types="@altv/types-client" />
// <reference types="@altv/types-natives" />

// alt:V built-in module that provides client-side API.
import * as alt from 'alt-client';
// alt:V built-in module that provides natives API (functions from GTA V).
import * as native from "natives";

alt.log('Client-side has loaded!');

alt.onServer('Server:Log', (msg1, msg2) => {
    alt.log(`Message From Server: ${msg1}`);
    alt.log(`Message From Server: ${msg2}`);
});

//вызов гташных уведмолени с помощью нативок 
function drawNotification(message, autoHide = false) {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(message);
    const notificationId = native.endTextCommandThefeedPostTicker(false, false);
    
    // Таймер для скрытия уведомления через 3 секунды если кроме текста сообщения также передали true
     if (autoHide !== false) {
        setTimeout(() => {
          // Удаление уведомления по его ID
          native.thefeedRemoveItem(notificationId);
        }, 3000);
    }
}
//для вызова уведомлений со стороны сервера
alt.onServer('drawNotification', drawNotification);
//уведомления через WebView
class NotificationManager {
    constructor() {
        this.webView = null;
        this.isInitialized = false;
        this.isWebViewOpen = false;
        this.init();
    }
    
    async init() {
            this.webView = new alt.WebView('http://resource/client/html/index.html');
            await new Promise(resolve => {
                this.webView.on('load', resolve);
                alt.setTimeout(resolve, 2000);
            });
            this.isInitialized = true;
            console.log('Notification manager initialized');
    }

    showPersistent(title, text, id = null) {
        if (!this.isInitialized) {
            console.log('Notification manager не инициализирован');
            return null;
        }
        
        const notificationId = id || `persistent_${Date.now()}`;
        this.webView.emit('showPersistentNotification', notificationId, title, text);
        this.isWebViewOpen = true;
        return notificationId;
    }
    
    hidePersistent(id) {
        if (this.isInitialized) {
            this.webView.emit('hidePersistentNotification', id);
        }
        this.isWebViewOpen = false;
    }
}

const notificationManager = new NotificationManager();

class VehicleBlocker {
    constructor() {
        this.vehBlocked = false; 
    }
    blockPlayerVehicle(player) {
         if (this.vehBlocked == true) return;
         if (!player || !player.valid || !player.vehicle) return;
         
         player.vehicle.frozen = true;
         this.vehBlocked = true; 
         alt.log(`Авто заблокировано`);
    }
    unblockPlayerVehicle(player) {
         if (this.vehBlocked == false) return;
         if (!player || !player.valid) return;
         player.vehicle.frozen = false;
         this.vehBlocked = false;
          alt.log(`Авто разблокировано`);
    }
}

class DeliveryJob {
    constructor() {
        this.keyCheckHandler = null;        //для проверки нажатия клашиши необходимой для погрзки/разгрузки
        this.allowedVehicles = [];          //данные из конфига
        this.loadedvehid = null;            //сетевой id машины в которую был загружен заказ
        this.loadingPoints = [];            //данные из конфига
        this.unloadingPoints = [];          //данные из конфига
        this.policeStations = [];           //данные из конфига
        this.loadingBlips = [];             //для текущей погрузки
        this.loadingPoint = null;           //для текущей погрузки
        this.unloadingPoint = null;         //для текущей разгрузки
        this.unloadingBlips = [];           //для текущей разгрузки
        this.markers = [];                  // Массив для хранения текущих маркеров точки погрузки/разгрузки
        this.colshapes = [];                //колшейпы точек погрузок и разгрузок
        this.loadingMarkerType = null;      //запоминает тип маркера точки загрузки из конфига
        this.unloadingMarkerType = null;    //запоминает тип маркера точки разгрузки из конфига
        this.currentMarkerType = null;      //для проверки текущего состояния заказа (либо на точке разгрузки либо на точке погрузки)
        this.currentUnloadingPos = null;    //позиция текущей точки разгрузки (защита от читеров что бы не смогли разгружаться/загружаться далеко от точки)
        this.currentLoadingPos = null;      //позиция текущей точки погрузки (защита от читеров что бы не смогли разгружаться/загружаться далеко от точки)
        this.markerColshapeMap = new Map();     // Связь маркеров с колшейпами
        this.vehicleBlocker = new VehicleBlocker(); //для блокировки на разгрузке/погрузке
        this.cargoBase = new DeliveryJob.IllegalCargo();    // что бы обращаться к CargoBase и IllegalCargo
        this.registerColshapeHandlers();
        this.init();
    }

    init() { 
        // получение данных из конфига с сервера
        alt.onServer('initLoadingPoints', (points) => {
            this.loadingPoints = points;
            this.selectRandomLoadingPoint(); //сразу при входе на сервер будет точка погрузки 
        });
        // получение данных из конфига с сервера
         alt.onServer('initUnloadingPoints', (points) => {
            this.unloadingPoints = points;
        });
        // получение данных из конфига с сервера
         alt.onServer('initPoliceStations', (points) => {
            this.policeStations = points;
            this.createPoliceBlips();   //сразу при входе на сервер будут блипы участков на карте
            this.cargoBase.createPoliceColshapes(this.policeStations);  //нужны для проверки нелегального груза
        });
        // получение данных из конфига с сервера
         alt.onServer('initAllowedVehicles', (VehHash) => {
            this.allowedVehicles = VehHash;
        });
        // когда прописывается команда /randomload уничтожаются все точки погрузки разгрузки очищается ифнормация о грузе потом выбирается новая точка погрузки
        alt.onServer('client:delivery', () => {
            this.destroyAllPoints();
            this.loadedvehid = null;
            this.cargoBase.loadtype = null;
            this.selectRandomLoadingPoint();
        });
        // нужна для очистки информации о грузе при провале доставки типа hard и danger, так как они отменяются при получении урона по авто, а это проверяется только на сервере
        alt.onServer('client:clearLoadedVehicle',() => {
            this.destroyAllPoints();
            this.loadedvehid = null;
            this.cargoBase.loadtype = null;
        });
        // визуальный взрыв при провале груза типа danger
        alt.onServer("explode",() =>{
            const player = alt.Player.local;
            native.addExplosion(
                player.vehicle.pos.x,
                player.vehicle.pos.y,
                player.vehicle.pos.z,
                9, // тип взрыва (9 - Vehicle)
                5.0, // радиус
                true, // звук
                false, // невидимый огонь
                0.0, // камера shake
                true
            );
        });
    }

    registerColshapeHandlers() {
        alt.on('entityEnterColshape', (colshape, entity) => {
            this.handleEntityEnterColshape(colshape, entity);
        });
        
        alt.on('entityLeaveColshape', (colshape, entity) => {
            this.handleEntityLeaveColshape(colshape, entity);
        });
    }
//проверки входа в колшейп
handleEntityEnterColshape(colshape, entity) {
        const pointBase = new DeliveryJob.PointBase(this);
        //если колшейп загрузки
        if (this.currentMarkerType === this.loadingMarkerType){
            pointBase.PointLoad(colshape, entity);
        }
        //если колшейп разгрузки
        if (this.currentMarkerType === this.unloadingMarkerType){
            pointBase.PointUnload(colshape, entity);
        }
        //если колшейп полицеского участка и груз Illegal
        if (this.cargoBase instanceof DeliveryJob.IllegalCargo && this.cargoBase.policeColshapes && this.cargoBase.policeColshapes.includes(colshape) && (this.cargoBase.loadtype === 'Illegal')) {
            const shouldDestroy = this.cargoBase.handleEnterPoliceZone(colshape, entity, this.loadedvehid); 
            if (shouldDestroy === true) {
                this.destroyAllPoints();
            }
        }
}

// при выходе из колшейпа
handleEntityLeaveColshape(colshape, entity) {
    if (entity instanceof alt.Player) {
        const marker = this.markerColshapeMap.get(colshape);
        if (notificationManager.isWebViewOpen !== false){   //если у игрока открыта надпись Нажмите E
            notificationManager.hidePersistent();
        }
        if (marker && entity === alt.Player.local && marker.originalColor) {
            marker.color = marker.originalColor;    //смена цвета с зеленого на изначальный (красный), цвет меняется только у маркеров погрузки
        }
    }
}

//класс для работы с точкой погрузки и разгрузки
static PointBase = class {
    constructor(deliveryJob) {
        this.deliveryJob = deliveryJob;
    }

    //логика для погрузки
    PointLoad(colshape, entity){
        const player = alt.Player.local;
        const marker = this.deliveryJob.markerColshapeMap.get(colshape);
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;    //если игрок не в авто дальнейшие проверки не идут
                entity = player.vehicle; // Переключение на проверку авто
            }
            if (marker) {
                // Если игрок в транспорте, проверка на разрешенные модели авто
                if (player.vehicle) {   //если неправильная модель авто ничего не происходит, только логи в консоль
                    if (!this.deliveryJob.allowedVehicles.includes(player.vehicle.model)) {
                        alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                        alt.log(`Неправильное авто`);
                        return;
                    }
                }
                 // если проверки на правильный тип авто сработали мется цвет маркера и появляется надпись нажмите E для погрузки из WebView
                marker.originalColor = marker.color;
                marker.color = new alt.RGBA(0, 255, 0, 200);
                alt.log(`Вошел в colshape`);
                notificationManager.showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");
            this.deliveryJob.keyCheckHandler = alt.everyTick(() => {    //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
                if (alt.isKeyDown(69) && (notificationManager.isWebViewOpen !== false) && (this.deliveryJob.currentMarkerType === this.deliveryJob.loadingMarkerType) && (this.deliveryJob.currentLoadingPos.distanceTo(player.pos) < 10)) {
                    notificationManager.hidePersistent();   //При нажатии E закрывается WebView
                    if (!player.vehicle) {  // Если игрок заехал в колшеп на транспорте но вышел и нажал E ничего не происходит (WebView закрылось ранее поэтому ему придется перезаезжать в колшейп)
                        drawNotification('Вы не находитесь в транспорте');
                        return;
                    }
                    if (!this.deliveryJob.allowedVehicles.includes(player.vehicle.model)) { // снова проверка на правильное авто (вдруг игрок заехал в колшейп на правильном авто и невыходя из колшейпа пересел в неправильное авто)
                        alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                        drawNotification('Неправильное авто');
                        return;
                    }
                    drawNotification('Погрузка началась...', true); //true значит что уведмоление пропадет через 3 чекунды
                    this.deliveryJob.vehicleBlocker.blockPlayerVehicle(player); //блок авто
                    this.deliveryJob.loadedvehid = player.vehicle.id;   //запоминает сетевой id авто в котором произошла погрузка
                    alt.log(`Сетевой ID загруженного авто: ${this.deliveryJob.loadedvehid}`);  
                    setTimeout(() => {  // через 3 секунды окончание погрузки
                        this.deliveryJob.vehicleBlocker.unblockPlayerVehicle(player);
                        this.deliveryJob.destroyAllPoints();    //уничтожается блип маркер и колшейп погрузки
                        this.deliveryJob.cargoBase.SelectCargoType();   //рандомится тип груза (там определяется loadtype)
                        alt.emitServer('client:setLoadedVehicle', String(this.deliveryJob.cargoBase.loadtype), this.deliveryJob.loadedvehid);   //передается на сервер тип груза и сетевой id загруженного авто
                        alt.log(`this.cargo.loadtype: ${ this.deliveryJob.cargoBase.loadtype}`);
                        this.deliveryJob.selectRandomUnloadingPoint(); 
                    }, 3000);
                }
            });
            if (this.deliveryJob.loadedvehid !== null){     //если авто загрузилось избавляемся от проверки на нажатие E (и остальных требоавний)
                alt.clearEveryTick(this.deliveryJob.keyCheckHandler);
                this.deliveryJob.keyCheckHandler = null;
            }
        }
    }

        // логика для разгрузки
    PointUnload(colshape, entity){
        const player = alt.Player.local;
        const marker = this.deliveryJob.markerColshapeMap.get(colshape);
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;    //если игрок не в авто дальнейшие проверки не идут
            entity = player.vehicle; // Переключение на проверку транспорта
        }
        if (marker) {
            // Если игрок в транспорте, проверяется заехал ли он на точку в том же авто в котором грузился (по сетевому id авто)
            if (player.vehicle) {
                if (this.deliveryJob.loadedvehid !== player.vehicle.id){
                    drawNotification('Это не тот автомобиль который вы загружали');
                    alt.log(`'Это не тот автомобиль который вы загружали`);
                    return;
                }
            }
            alt.log(`Вошел в colshape`);
            //WebView нажмите E для разгрузки
            notificationManager.showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");
            this.deliveryJob.keyCheckHandler = alt.everyTick(() => {    //проверка на нажатие E и соблюдение всех необходимых условий для разгрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
                if (alt.isKeyDown(69) && (notificationManager.isWebViewOpen !== false) && (this.deliveryJob.currentMarkerType === this.deliveryJob.unloadingMarkerType) && (this.deliveryJob.currentUnloadingPos.distanceTo(player.pos) < 15)) {
                    notificationManager.hidePersistent();        //скрыть WebView               
                    if (!player.vehicle) {  //если игрок вышел из авто после въезда в колшейп
                        drawNotification('Вы не находитесь в транспорте');
                        return;
                    }
                //тут нет проверки как в погрузке, на случай если игрок пересел в другое авто после того как въехал в колшейп на правильном авто, потому что никакую выгоду игроку это не даст 
                drawNotification('Разгрузка началась...', true);    //true значит что уведмоление пропадет через 3 чекунды
                this.deliveryJob.vehicleBlocker.blockPlayerVehicle(player);
                    setTimeout(() => {  //через 3 секунды разгрузка закончится 
                        this.deliveryJob.vehicleBlocker.unblockPlayerVehicle(player);
                        this.deliveryJob.cargoBase.CargoPayment();  //вызов уведмоления с оплатой
                        //доставка окончена вся информация стирается
                        this.deliveryJob.loadedvehid = null;    
                        this.deliveryJob.cargoBase.loadtype = null;
                        this.deliveryJob.destroyAllPoints();
                    }, 3000);
                }
            }); //если авто разгрузилось избавляемся от проверки на нажатие E (и остальных требоавний)
            if (this.deliveryJob.loadedvehid === null){
                alt.clearEveryTick(this.deliveryJob.keyCheckHandler);
                this.deliveryJob.keyCheckHandler = null;
            }
        }
    }
}
    
    createBlip(point, sprite, color) {
            const blip = new alt.PointBlip(point.x, point.y, point.z);
            blip.sprite = sprite;
            blip.color = color;
            blip.name = point.name;
            blip.scale = point.blipscale;
    //      blip.scale = point.blipscale !== undefined ? point.blipscale : 1.0;
            blip.shortRange = point.blipshortRange;
    //      blip.shortRange = point.blipshortRange !== undefined ? point.blipshortRange : false;
            return blip;
    }

    createMarker(point, markerType, color) {
            const markerPos = new alt.Vector3(point.x, point.y, point.z);
            const marker = new alt.Marker(
                markerType,
                new alt.Vector3(point.x, point.y, point.z),
                new alt.RGBA(color[0], color[1], color[2], color[3])
            );
        alt.log(`Создан маркер для: ${point.name}`);
        alt.log(`Координаты маркера: (${markerPos.x}, ${markerPos.y}, ${markerPos.z})`);
        alt.log(`Параметры маркера: type=${markerType}, color=[${color.join(', ')}]`);
        this.currentMarkerType = markerType;
            return marker;
    }
    
    createColshape(point, radius, marker) {
        const colshape = new alt.ColshapeSphere(point.x, point.y, point.z, radius);
        this.markerColshapeMap.set(colshape, marker);
        this.colshapes.push(colshape);
        
        return colshape;
    }

    createBlipWithMarker(point) {
        alt.log(`Создание блипа и маркера для точки: ${point.name}`);
        alt.log(`Данные точки:`, JSON.stringify(point));

        const blip = this.createBlip(
            point,
            point.blipSprite,
            point.blipColor
        );
        const marker = this.createMarker(point, point.markerType, point.markerColor);
        const colshape = this.createColshape(point, point.colshapeRadius, marker);
        this.colshapes.push(colshape);
        alt.log(`Создан colshape для точки: ${point.name} с радиусом: ${point.colshapeRadius}`);
        return { blip, marker };
    }

    addMarker(marker) {
        if (marker) {
            this.markers.push(marker);
            alt.log(`Маркер добавлен в массив markers. Всего маркеров: ${this.markers.length}`);
        } else {
            alt.log(`Ошибка: попытка добавить undefined маркер`);
        }
    }
// очистка всех точек погрузок и разгрузок и их элементов в случае провала или окончания доставки
destroyAllPoints() {
    let destroyedCount = 0;

    this.markers.forEach(marker => {
        if (marker && marker.destroy) {
            marker.destroy();
            destroyedCount++;
        }
    });
    
    this.unloadingBlips.forEach(blip => {
        if (blip && blip.destroy) {
            blip.destroy();
            destroyedCount++;
        }
    });
    
    this.loadingBlips.forEach(blip => {
        if (blip && blip.destroy) {
            blip.destroy();
            destroyedCount++;
        }
    });
    //уничтожает колшейпы погрузок и разгрузок, полицеские не уничтожаются храняться в policeColshapes
    this.colshapes.forEach(colshape => {
        if (colshape && colshape.destroy) {
            colshape.destroy();
            destroyedCount++;
        }
    });
    this.currentLoadingPos =null;   //по идее обнулять ненужно так как при каждой новой точке записывается новое знаечение, но пусть будет
    this.currentUnloadingPos =null; //по идее обнулять ненужно так как при каждой новой точке записывается новое знаечение, но пусть будет
    // очистка всех массивов
    this.markers = [];
    this.unloadingBlips = [];
    this.loadingBlips = [];
    this.colshapes = [];
    this.markerColshapeMap.clear();
    alt.log(`Уничтожено ${destroyedCount} элементов погрузки/разгрузки`);
}

selectRandomLoadingPoint() {
    const randomIndex = Math.floor(Math.random() * this.loadingPoints.length);
    this.loadingPoint = this.loadingPoints[randomIndex];
    this.currentLoadingPos = new alt.Vector3(this.loadingPoint.x, this.loadingPoint.y, this.loadingPoint.z);
    const item = this.createBlipWithMarker(this.loadingPoint);
    this.addMarker(item.marker);
    this.loadingBlips.push(item.blip);
    alt.log(`Выбрана точка погрузки: ${this.loadingPoint.name}`); 
    this.loadingMarkerType = this.loadingPoint.markerType;  // запоминает данные из конфига о типе маркера погрузки (если поменяется тип маркера в конфиге не придется переписывать код), нужно для проверки состояния заказа
}

selectRandomUnloadingPoint() {
    const randomIndex = Math.floor(Math.random() * this.unloadingPoints.length);
    this.unloadingPoint = this.unloadingPoints[randomIndex];
    this.currentUnloadingPos = new alt.Vector3(this.unloadingPoint.x, this.unloadingPoint.y, this.unloadingPoint.z);
    
    // Проверка расстояния до полицейских участков (только для Illegal груза)
    if (this.cargoBase instanceof DeliveryJob.IllegalCargo && this.cargoBase.loadtype === 'Illegal') {
        const isDangerous = this.checkDistanceToPoliceStations(this.unloadingPoint);
        //если проверка на расстояние дала <350 метров выбирается новая точка разгрузки
        if (isDangerous === true) {
            alt.log('Выбрана близкая к полиции точка, выбирается другая...');
            this.selectRandomUnloadingPoint(); //рекурсивный выбор точки
            return;
        }
    }
    const item = this.createBlipWithMarker(this.unloadingPoint); 
    this.addMarker(item.marker);
    this.unloadingBlips.push(item.blip); 
    alt.log(`Выбрана точка разгрузки: ${this.unloadingPoint.name}`);
    this.unloadingMarkerType = this.unloadingPoint.markerType;// запоминает данные из конфига о типе маркера разгрузки (если поменяется тип маркера в конфиге не придется переписывать код), нужно для проверки состояния заказа
}
// Проверка расстояния от точки разгрузки до полицейских участков (если меньше 350 метров выбирается другая точка)
checkDistanceToPoliceStations(unloadingPoint) {
    const isDangerous = this.cargoBase.policeColshapes.some((colshape, index) => {
   
        if (colshape && colshape.valid) {
            const policePos = colshape.pos;
            const distance = this.currentUnloadingPos.distanceTo(policePos);
            if (distance < 350) {
                alt.log(`Участок ${index + 1}: участок находится на расстоянии ${distance.toFixed(2)} единиц`);
                return true;
            }
        }
        return false;
    });
    return isDangerous;
}

createPoliceBlips() {
    this.policeStations.forEach(station => {
        const item = this.createBlip( station, station.blipSprite, station.blipColor );
        });
    alt.log(`Создано ${this.policeStations.length} полицейских участков`);
}
//вся логика которая относится к типу груза
static CargoBase = class {
    constructor() {
        this.loadtype = null;
        this.policeColshapes = [];
        this.cargoTypes = ['Illegal', 'Hard', 'Danger', 'Common'];
    }
// Выбор случайного типа груза
SelectCargoType (){
    const randomIndex = Math.floor(Math.random() * this.cargoTypes.length);
    this.loadtype = this.cargoTypes[randomIndex];  
    alt.log(`Тип данных: ${typeof this.loadtype}, Значение: ${this.loadtype}`);
    drawNotification(`Загружен груз типа: ${this.loadtype}`);
}

CargoPayment (){
    switch (this.loadtype) {
        case 'Common':
            drawNotification('+1000\$');
        break;

        case 'Hard':
            drawNotification('+2000\$');
        break;

        case 'Danger':
            drawNotification('+3000\$');
        break;

        case 'Illegal':
            drawNotification('+1500\$');
        break;
        }
    }
};
//требовалось в тз
    static CommonCargo = class extends DeliveryJob.CargoBase {
        constructor() {
          super();
        }

    };
    
//требовалось в тз
    static HardCargo = class extends DeliveryJob.CargoBase {
        constructor() {
            super();
        }
        
    };
    
//требовалось в тз
    static DangerCargo = class extends DeliveryJob.CargoBase {
         constructor() {
            super();
        }

    };
    
//необходимая логика для Illegal груза
    static IllegalCargo = class extends DeliveryJob.CargoBase {
        constructor() {
            super();
        this.policeColshapes = []; // Массив для хранения полицейских колшейпов
        }

    createPoliceColshapes(policeStations) { 
        policeStations.forEach((station) => {
            const policeColshape = new alt.ColshapeSphere(station.x, station.y, station.z, 350);
            this.policeColshapes.push(policeColshape);
        });
        alt.log(`Создано ${this.policeColshapes.length} полицейских колшейпов`);
    }
    
    handleEnterPoliceZone(colshape, entity, loadedvehid) {
        const player = alt.Player.local;
        if (entity instanceof alt.Player) {
            if (!player.vehicle ) return false;
            entity = player.vehicle; // Переключение на проверку транспорта
            if (entity.id !== loadedvehid) return false; 
            alt.log(`Вошел в зону полицейского участка, vehicle.id ${entity.id}`);
            drawNotification('Вы находились слишком близко к полицейскому участку'); 
            drawNotification('Заказ отменен!');
            return true; // true - нужно уничтожить точки
        }
        
    }
};
}
new DeliveryJob();