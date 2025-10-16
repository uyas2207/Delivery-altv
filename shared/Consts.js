export const DeliveryState = {
    EMPTY: 'empty', //
    SELECTING_POINTS: 'selecting_points',   //
    WAITING_FOR_LOADING: 'waiting_for_loading', //
    DELIVERING: 'delivering',   //
    ACTIVE: 'active',           //используется только на сервере, показывает что заказ только что начался
    COMPLETED: 'completed', // используется только на сервере без функционала (нужно для деабага)
    CANCELLED: 'cancelled', // используется только на сервере без функционала (нужно для деабага)
    FAILED: 'failed'        // используется только на сервере без функционала (нужно для деабага)
};
 
export const PointBaseType = {
// у PointBase существует логика только для 2 типов точки loading и unloading
    LOADING: 'loading', 
    UNLOADING: 'unloading'
};

//export default DeliveryState;