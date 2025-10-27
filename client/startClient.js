import * as alt from 'alt-client';
import * as native from "natives";
import html from './html/index.html?raw'; // добавляем ?raw чтобы raw-loader отработал


//вызов гташных уведмолени с помощью нативок 
function drawNotification(message, autoHide = false) {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(message);
    const notificationId = native.endTextCommandThefeedPostTicker(false, false);
    // Таймер для скрытия уведомления через 3 секунды если кроме текста сообщения также передали true
    if (autoHide) {
        setTimeout(() => {
            native.thefeedRemoveItem(notificationId);
        }, 3000);
    }
}
//для вызова уведомлений со стороны сервера
alt.onServer('drawNotification', drawNotification);

//уведомления через WebView
class NotificationManager {
    static instance = null;    //для хранения единственного экземпляра класса
    //глобальный метод для получение экземпляра класса (информации о состоянии WebView)
    static getInstance() {
        if (!this.instance) {   // если экземпляр не существует создает его
            alt.log('instance создан в первый раз:');
            this.instance = new NotificationManager();
        }
        alt.log('Передан instance:');
        alt.log(`this.instance: ${JSON.stringify(this.instance, null, '\t')}`);
        // возвращает существующий или только что созданный экземпляр
        return this.instance;
    }

    constructor() {
        //проверка если NotificationManager уже создан ранее то осатльной код constructor не пройдет (по идее таких ситуаций быть не может)
        if (NotificationManager.instance) {
            alt.log('Повторный вызов constructor NotificationManager');
            return NotificationManager.instance;
        }
        
        this.webView = null;
        this.isInitialized = false;
        this.isWebViewOpen = false;

        //сохраняет созданный экземпляр
        alt.log(`Созданный экземпляр: ${JSON.stringify(this, null, '\t')}`);
        NotificationManager.instance = this;
    }
    
    async initialize() {
        // если уже инициализирован, ничего не делает (по идее таких ситуаций быть не может)
        if (this.isInitialized) {
            alt.log('NotificationManager уже инициализирован (ПОВТОРНАЯ ПОПЫТКА ВЫЗОВА INITIALIZE)');
            return;
        }
        // запуск инициализации
        await this.init();
    }

    async init() {
       this.webView = new alt.WebView(`data:text/html;charset=UTF-8,${encodeURIComponent(html)}`);
        
        //this.webView = new alt.WebView('http://resource/dist/client/html/index.html');

            const loadPromise = new Promise((resolve) => {
                this.webView.once('load', () => resolve(true));
            });
            
            const timeoutPromise = new Promise((resolve) => {
                alt.setTimeout(() => resolve(false), 10000);
            });
            //если WebView не загрузится за 2 секунды будет isLoaded = false
            const isLoaded = await Promise.race([loadPromise, timeoutPromise]);
            
            if (isLoaded) {
                this.isInitialized = true;
                alt.log('Notification manager initialized SUCCESS');
            } else {
                alt.log('Notification manager did not initialize FAILURE (timeout)');
            }
    }

    showPersistent(title, text, id = null) {
        if (!this.isInitialized) {
            alt.log('Notification manager не инициализирован');
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
            this.isWebViewOpen = false;
        }
        else{
            alt.log('Попытка скрыть Notification при isInitialized === null');
            this.isWebViewOpen = false;
        }
    }
}

// Блокировщик транспорта
class VehicleBlocker {
    async blockVehicleForThreeSeconds(vehicle) {
        return new Promise((resolve) => {    
            if (vehicle && vehicle.valid) {
                vehicle.frozen = true;
                 setTimeout(() => {
                    vehicle.frozen = false;
                    resolve();
                }, 3000);
            } else {
                resolve(); // Если транспорт невалиден, сразу разрешаем промис
                alt.log('Ошибка, неправильный reslove')
            }
        });

    }
}


// Класс для создания и уничтожения визуальных элементов точки
class PointVisuals {
    constructor(pointConfig) {
        this.pointConfig = pointConfig;
        this.position = new alt.Vector3(pointConfig.x, pointConfig.y, pointConfig.z);

        this.marker = null;
        this.blip = null;
        this.colshape = null;
    }

    create() {
        //Так как colshapeRadius у полицейских учатсков не прописан в конфиге он undefined
        if (this.pointConfig.colshapeRadius === undefined){
            this.pointConfig.colshapeRadius = 350;
        }
        // Создание маркера
        //у полицейских участков нет маркера в конфиге поэтому он undefined
        if (this.pointConfig.markerType !== undefined) {
            this.marker = new alt.Marker(this.pointConfig.markerType, this.position, new alt.RGBA(
                this.pointConfig.markerColor[0], 
                this.pointConfig.markerColor[1], 
                this.pointConfig.markerColor[2], 
                this.pointConfig.markerColor[3]
                )
            );
        }

    // Создание блипа
    this.blip = new alt.PointBlip(this.position.x, this.position.y, this.position.z);
    this.blip.sprite = this.pointConfig.blipSprite;
    this.blip.color = this.pointConfig.blipColor;
    this.blip.name = this.pointConfig.name;
    this.blip.shortRange = this.pointConfig.blipshortRange;

    // Создание колшейпа
    this.colshape = new alt.ColshapeSphere(
        this.position.x, 
        this.position.y, 
        this.position.z,
        this.pointConfig.colshapeRadius
    );

    return this;
    }

    destroy() {
        if (this.marker) this.marker.destroy();
        if (this.blip) this.blip.destroy();
        if (this.colshape) this.colshape.destroy();
    }
}

// Общая система управления доставкой создается при подключении игрока
class DeliveryJobClient {
    constructor() {        
        //данные полученные из конфига
        this.config = {
            unloadingPoints: [],
            loadingPoints: [],
            allowedVehicles: [],
            policeStations: []
        };
        this.DeliveryState = null; // Добавляем свойство для хранения DeliveryState

        this.loadingMarkerType = null;  //текщая точка погрузки
        this.unloadingMarkerType = null;    //текущая точка разгрузк
        this.policeColshapes = []; // Массив для хранения колшейпов полиции
        
        this.state = null;     //текущее состояние системы доставки
        this.currentOrder = null;   // В будущем класс для конкретного заказа, пока что null что бы не использовать что либо что относится только к конкретному заказау до того как игрок начнет конкретный заказ

       // this.vehicleBlocker = new VehicleBlocker(); //для блокировки на разгрузке/погрузке
        
        this.initializeNotificationManager();

        this.init();
    }

    // метод для инициализации NotificationManager
    async initializeNotificationManager() {
        alt.log('1. Инициализация NotificationManager');
        // получает экземпляр Singleton (создается при первом вызове)
        const notificationManager = NotificationManager.getInstance();
        
        //инициализирует WebView
        await notificationManager.initialize();
            
        alt.log('1. NotificationManager инициализирован через DeliveryJobClient');
    }

    init() { 
        alt.log('2. Инициализация системы доставки.');
        // получение данных из конфига с сервера
        alt.onServer('initLoadingPoints', (points) => {
            this.config.loadingPoints = points;
        });
        // получение данных из конфига с сервера
        alt.onServer('initUnloadingPoints', (points) => {
            this.config.unloadingPoints = points;
        });
        // получение данных из конфига с сервера
        alt.onServer('initPoliceStations', (points) => {
            this.config.policeStations = points;
            this.createPoliceBlipsColshapes();  //сразу при входе на сервер будет точка погрузки 
        });
        // получение данных из конфига с сервера
        alt.onServer('initAllowedVehicles', (VehHash) => {
            this.config.allowedVehicles = VehHash;
        });
        // получение DeliveryState с сервера
        alt.onServer('initDeliveryState', (deliveryState) => {
            this.DeliveryState = deliveryState;
            this.state = this.DeliveryState.SELECTING_POINTS; // инициализируем начальное состояние
            alt.log('DeliveryState получен и установлен');
        });
        // при старте заказа приходит с сервера client:startDelivery, и начинается заказ на клиенте
        alt.onServer('client:startDelivery', (cargoType) => {
            this.startNewOrder(cargoType);  //тип груза определяется на сервере
            alt.log(`cargoType ${cargoType}`);
        });
        // нужно для очистки информации о грузе при провале доставки
        alt.onServer('client:cancelDelivery', () => {
            this.cancelCurrentOrder();
        });
        //для очистки обработчиков после выхода игрока с сервера
        alt.onServer('client:destroyDeliveryJob',() => {
            this.destroy();
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
        // Обработка входа/выхода из колшейпов
        alt.on('entityEnterColshape', this.handleEnterColshapeDeliveryJobClient.bind(this));
        alt.on('entityLeaveColshape', this.handleLeaveColshapeDeliveryJobClient.bind(this));
        }
    //создание полицеских блипов и колшейпов
    createPoliceBlipsColshapes() {
        this.config.policeStations.forEach((station, index) => {
            const policeVisuals = new PointVisuals(station).create();
        
            // добавление дополнительных свойст для колшейпов после создания создания
            policeVisuals.colshape.isPoliceZone = true; // нужно для проверки что автомобиль попал именно в полицейский колшейп, а не какой то другой
            policeVisuals.colshape.policeStationId = index; //нужно для проверки в какой из полицейских участков заехал автомобиль
            //добавление данных созданной точки в массив
            this.policeColshapes.push(policeVisuals.colshape);
        });
        alt.log(`Создано ${this.config.policeStations.length} полицейских участков`);
    }
    // создание заказа доставки 
    startNewOrder(cargoType) {
        //если существует текущий заказ он отменяется
        if (this.currentOrder) {
            this.cancelCurrentOrder();
        }
        // инициализируется класс конкретного заказа только при старте конкретного заказа
        this.currentOrder = new DeliveryOrder(
            cargoType,
            this.config,
            this.policeColshapes,
            this.DeliveryState // передает DeliveryState в DeliveryOrder
        );
        this.currentOrder.deliveryJobClient = this; // cсылка для последующего обнуления
        this.currentOrder.start();  //старт конкретного заказа в DeliveryOrder
    }

    cancelCurrentOrder() {
        if (this.currentOrder) {
            this.currentOrder.cancel(); //отмена конкретного заказа в DeliveryOrder
            this.currentOrder = null;   //обнуление ссылки
        }
    }
    //логика на вход в колшейп
    handleEnterColshapeDeliveryJobClient(colshape, entity) {
        const player = alt.Player.local;
        //проверка на то что игрок в машине, в доставке если игрок не в машине ничего никогда не происходит
        if (entity instanceof alt.Player) {
            if (!player.vehicle) return;
        }
        // проверка на случай если будут добавлены еще колшейпы и в них зайдет игрок без заказа доставки
        if (this.currentOrder !== null) {
            alt.log(`Вошел в колшейп`);
            this.currentOrder.handleColshapeEnterDeliveryOrder(colshape);   //логика входа в колшейп у конкретного заказа
        }
    }
    //выход из колшейпа
    handleLeaveColshapeDeliveryJobClient(colshape, entity) {
        if (NotificationManager.getInstance().isWebViewOpen){
            NotificationManager.getInstance().hidePersistent();
            //очищает обработчик нажатия клавиши (который создается только при открытии WebViewOpen, поэтому в других случаях его можно не очищать)
            this.currentOrder.handleColshapeLeave(colshape, entity);
        }
    }     

}

// Конкретный заказ на клиенте, создается только при старте доставки у конкретного игрока (не при входе на сервер)
class DeliveryOrder {
    constructor(cargoType, config, policeColshapes, DeliveryState) {
        //Данные из конфига
        this.cargoType = cargoType; //тип груза CommonCargo, HardCargo, DangerCargo, IllegalCargo
        this.config = config;   // (все loadingPoints, все unloadingPoints, все allowedVehicles, все policeStations)
        this.policeColshapes = policeColshapes;
        this.DeliveryState = DeliveryState; // сохраняет DeliveryState
        
        this.state = this.DeliveryState.SELECTING_POINTS;    // использует константу из DeliveryState 'selecting_points'	изначальное состояние при старте системы
        this.loadingPoint = null;   //текущая точка погрузки
        this.unloadingPoint = null; //текущая точка разгрузки
        this.loadedVehId = null;    //сетевой id загруженной машины
        this.deliveryJobClient = null; //переменная для хранения ссылки

        this.pointBaseType = {LOADING: 'loading', UNLOADING: 'unloading'}; // тип точки передается в Pointbase (и нигде не используется)
    }

    async start() {
        await this.selectPoints();
        this.createLoadingPoint();
        this.state = this.DeliveryState.WAITING_FOR_LOADING;   //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
    }

    selectPoints() {
        return new Promise((resolve) => {
            // Выбор случайных точек            
            this.loadingPoint = this.config.loadingPoints[Math.floor(Math.random() * this.config.loadingPoints.length)];
            this.unloadingPoint = this.config.unloadingPoints[Math.floor(Math.random() * this.config.unloadingPoints.length)];
            
            
            // Проверка для нелегального груза
            if (this.cargoType === 'Illegal') {
                this.distanceFromPoliceStations();
            }
            resolve();
        });
    }
    // Проверка расстояния от выбранной точки разгрузки до полицейских участков
    async distanceFromPoliceStations() {
        const minDistance = 350;

        // unloadingPoint в Vector3 для расчета расстояния
        const unloadingPos = new alt.Vector3(this.unloadingPoint.x, this.unloadingPoint.y, this.unloadingPoint.z);
        
        let isTooClose = this.config.policeStations.some(station => {
            const stationPos = new alt.Vector3(station.x, station.y, station.z);
            const distance = unloadingPos.distanceTo(stationPos);
            alt.log(`Расстояние до полицейского участка ${station.name}: ${distance}`);
            return (distance < minDistance); //если distance меньше чем 350 isTooClose = true 
        });
        
        if (isTooClose) {
            // Перевыбираем точку разгрузки, не меняя точки погрузки
            alt.log(`Точка разгрузки слишком близко к полиции, выбираентся новая...`);
            this.unloadingPoint = this.config.unloadingPoints[Math.floor(Math.random() * this.config.unloadingPoints.length)];
            this.distanceFromPoliceStations(); // Рекурсивная проверка
            //если вдруг будет в конфиге слишком много точек близко к полиции что бы были временные промежутки между проверками (+ можно доавбить ограничение на количество повторных выборов точки разгрузки)
            await new Promise(resolve => alt.setTimeout(resolve, 10));
        }
    }

    createLoadingPoint() {
        // создает визуальные элементы (маркеры, блипы и колшейпы)
        const pointVisuals = new PointVisuals(this.loadingPoint).create();
        
        // создает PointBase с поведением (логика точки погрузки/разгрузки)
        this.loadingPoint = new PointBase(this.pointBaseType.LOADING, this, pointVisuals);
    }

    createUnloadingPoint() {
        // создает визуальные элементы (маркеры, блипы и колшейпы)
        const pointVisuals = new PointVisuals(this.unloadingPoint).create();
        
        // создает PointBase с поведением (логика точки погрузки/разгрузки)
        this.unloadingPoint = new PointBase(this.pointBaseType.UNLOADING, this, pointVisuals);
    }

    handleColshapeEnterDeliveryOrder(colshape) {
        alt.log(`alt.Player.local.vehicle.id: ${alt.Player.local.vehicle.id}`)
        
        // если в будущем будет добавлено больше колшейпов проверка handleColshapeEnterDeliveryOrder будет return
        if (!this.loadingPoint || !this.unloadingPoint || !this.policeColshapes) return;
        // если 'waiting_for_loading' значит колшейп точки погрузки
        if (this.state === this.DeliveryState.WAITING_FOR_LOADING) {    //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
            if (colshape === this.loadingPoint.pointVisuals.colshape){
                this.loadingPoint.PointLoad(colshape, alt.Player.local.vehicle);
            }
        } 
        //если 'delivering' значит колшейп точки разгрузки
        if (this.state === this.DeliveryState.DELIVERING) {  //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
            if (colshape === this.unloadingPoint.pointVisuals.colshape){
                this.unloadingPoint.PointUnload(colshape, alt.Player.local.vehicle);
           }
        }
        //если колшейп полицейский и груз Illegal и в колшейп вошли на загруженной машине
        if(colshape.isPoliceZone){
            if ((this.cargoType === 'Illegal') && (alt.Player.local.vehicle.id === this.loadedVehId)){
                alt.emitServer('client:failDelivery');  //отправляет на сервер информацию о провале доставки
            }
        }
    }

    handleColshapeLeave(colshape) {
    // Очищаем обработчики клавиш при выходе из колшейпа (только если открыта webview)
        if (this.state === this.DeliveryState.WAITING_FOR_LOADING && this.loadingPoint) {     //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
                this.loadingPoint.cleanup();
        }
        if (this.state === this.DeliveryState.DELIVERING && this.unloadingPoint) {   //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
                this.unloadingPoint.cleanup();
        }
    }
    //процесс погрзки (после проверки на соблюдение всех необходимых для нее требований)
    async executeLoading(vehicle) {
        const vehicleBlocker = new VehicleBlocker();
        drawNotification('Начало погрузки...', true);   //true значит что уведмоление пропадет через 3 чекунды
        await vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится

        this.loadedVehId = vehicle.id;

        this.loadingPoint.pointVisuals.destroy();
        this.createUnloadingPoint();
        this.state = this.DeliveryState.DELIVERING  //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
        
        drawNotification(`Погрузка завершена! Груз: ${this.cargoType}`);
        alt.emitServer('client:startLoading', this.loadedVehId);    //передает на сервер что игрок погрузил груз

    }
    //процесс разгрузки (после проверки на соблюдение всех необходимых для нее требований)
    async executeUnloading(vehicle) {
        const vehicleBlocker = new VehicleBlocker();
        drawNotification('Начало разгрузки...', true);   //true значит что уведмоление пропадет через 3 чекунды
        await vehicleBlocker.blockVehicleForThreeSeconds(vehicle); // даже если игрок выйдет из авто во время погрузки транспорт разблокируется и погрузка завершится

        this.loadedVehId = null;

        this.unloadingPoint.pointVisuals.destroy();
        this.state = this.DeliveryState.EMPTY;   //'empty'			нет активного заказа (провален или выполнен)
        
        alt.emitServer('client:completeDelivery');
        drawNotification(`Доставка завершена! Груз: ${this.cargoType}`);

        this.deliveryJobClient.currentOrder = null;

    }

     cancel() {
        // полная очистка ресурсов
        if (this.state === this.DeliveryState.WAITING_FOR_LOADING) { //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
            this.loadingPoint.cleanup();
            this.loadingPoint.pointVisuals.destroy();
            this.state = this.DeliveryState.EMPTY;   //'empty'			нет активного заказа (провален или выполнен)
        }
        if (this.state === this.DeliveryState.DELIVERING) {  //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
            this.unloadingPoint.cleanup();
            this.unloadingPoint.pointVisuals.destroy();
            this.loadedVehId = null;
            this.state = this.DeliveryState.EMPTY;   //'empty'			нет активного заказа (провален или выполнен)
        }
        
        // обнуление в родители
        if (this.deliveryJobClient) {
            this.deliveryJobClient.currentOrder = null;
        }
    }

}

// Класс точки с логикой для точки погрузки/разгрузки
class PointBase {
    constructor(type, deliveryOrder, pointVisuals) {
        this.type = type;   //по идее не нужен, так как нигде не используется
        this.deliveryOrder = deliveryOrder;
        this.pointVisuals = pointVisuals;
        this.keyPressHandler = null; // свойство для хранения обработчика
    }

    // метод PointLoad - инкапсулирует поведение точки погрузки
    PointLoad(colshape, entity) {
        alt.log (`PointLoad`)
        const player = alt.Player.local;
        
        // проверка на разрешенные модели авто
        if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) {
            drawNotification('Транспорт не подходит для перевозки');
            return;
        }

        NotificationManager.getInstance().showPersistent("Погрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать погрузку");
        
        //таких ситуаций в текущем коде быть не может, проверка есть на случай если потом будут добавлены еще обработчки при расширении функционала доставки
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик 1')
        }

        // Создает новый обработчик для клавиши E
        this.keyPressHandler = (key) => { 
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen) && (this.pointVisuals.position.distanceTo(player.pos) < 10)) {

                // удаляет обработчик после нажатия
                this.cleanup();
                NotificationManager.getInstance().hidePersistent();   //скрыть WebView
                if (!player.vehicle) {  // если игрок заехал в колшеп на транспорте но вышел и нажал E ничего не происходит (WebView закрылось ранее поэтому ему придется перезаезжать в колшейп)
                        drawNotification('Вы не находитесь в транспорте');
                        return;
                }
                if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) { // снова проверка на правильное авто (вдруг игрок заехал в колшейп на правильном авто и невыходя из колшейпа пересел в неправильное авто)
                    alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                    drawNotification('Неправильное авто');
                    return;
                }
                alt.log('Началась погрузка');
                this.deliveryOrder.executeLoading (player.vehicle);
            }   
        };

        // регистрирует обработчик
        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик погрузки')
    }

    // метод PointUnload - инкапсулирует поведение точки разгрузки
    PointUnload(colshape, entity) {
        const player = alt.Player.local;

        // проверка что это тот же транспорт что и был загружке
        if (this.deliveryOrder.loadedVehId !== player.vehicle.id) {
            drawNotification('Это не тот транспорт, в который был загружен груз');
            return;
        }

        NotificationManager.getInstance().showPersistent("Разгрузка", "Нажмите <span class='notification-key'>E</span> чтобы начать разгрузку");

        this.keyPressHandler = (key) => {
            //проверка на нажатие E и соблюдение всех необходимых условий для разгрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen) && (this.pointVisuals.position.distanceTo(player.pos) < 15)) {
                // удаляет обработчик после нажатия
                this.cleanup();
                NotificationManager.getInstance().hidePersistent();    //скрыть WebView
                //проверку ниже можно убрать, так как если игрок вышел из авто и/или пересел в другую машину ему это не даст никакого приемущества (но для логики игрового процесса стоит остаивть)
                if (!player.vehicle) {  // Если игрок заехал в колшеп на транспорте но вышел и нажал E ничего не происходит (WebView закрылось ранее поэтому ему придется перезаезжать в колшейп)
                        drawNotification('Вы не находитесь в транспорте');
                        return;
                }
                if (this.deliveryOrder.loadedVehId !== player.vehicle.id) { //если игрок заехал на загруженном транспорте, но не выходя из колшейпа пересел в другое авто (проверка для того что бы не нарушалась логика игрового процесса) 
                    drawNotification('Это не тот транспорт, в который был загружен груз');
                return;
                }
                alt.log('Началась разгрузка');
                this.deliveryOrder.executeUnloading (player.vehicle);
            }   
        };

        // регистрирует обработчик
        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик разгрузки')
    }

        // метод для очистки обработчика keyPressHandler
        cleanup() {
            if (this.keyPressHandler) {
                alt.off('keydown', this.keyPressHandler);
                alt.log('Удален обработчик')
                this.keyPressHandler = null;
            }
        }
}



new DeliveryJobClient();