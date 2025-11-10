import * as alt from 'alt-client';
// Класс точки с логикой для точки погрузки/разгрузки
export class PointBase {
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
            NotificationManager.getInstance().drawNotification('Транспорт не подходит для перевозки');
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
                        NotificationManager.getInstance().drawNotification('Вы не находитесь в транспорте');
                        return;
                }
                if (!this.deliveryOrder.config.allowedVehicles.includes(player.vehicle.model)) { // снова проверка на правильное авто (вдруг игрок заехал в колшейп на правильном авто и невыходя из колшейпа пересел в неправильное авто)
                    alt.log(`Vehicle ${player.vehicle.model} is not allowed`);
                    NotificationManager.getInstance().drawNotification('Неправильное авто');
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
            NotificationManager.getInstance().drawNotification('Это не тот транспорт, в который был загружен груз');
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
                        NotificationManager.getInstance().drawNotification('Вы не находитесь в транспорте');
                        return;
                }
                if (this.deliveryOrder.loadedVehId !== player.vehicle.id) { //если игрок заехал на загруженном транспорте, но не выходя из колшейпа пересел в другое авто (проверка для того что бы не нарушалась логика игрового процесса) 
                    NotificationManager.getInstance().drawNotification('Это не тот транспорт, в который был загружен груз');
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