export const DeliveryState = {
    EMPTY: 'empty',  //'empty'			нет активного заказа (провален или выполнен)
    SELECTING_POINTS: 'selecting_points',   ///'selecting_points'	изначальное состояние при старте системы на клиенте
    WAITING_FOR_LOADING: 'waiting_for_loading', //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
    DELIVERING: 'delivering',   //'delivering'		с момента погрузки до момента разгрузки (активна точка разгрузки)
    ACTIVE: 'active',           //используется только на сервере, показывает что заказ только что начался
    COMPLETED: 'completed', // используется только на сервере без функционала (нужно для деабага)
    CANCELLED: 'cancelled', // используется только на сервере без функционала (нужно для деабага)
    FAILED: 'failed'        // используется только на сервере без функционала (нужно для деабага)
};
