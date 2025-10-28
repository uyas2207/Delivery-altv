// создает глобальный объект напрямую
export const DeliveryState = {
    EMPTY: 'empty',
    SELECTING_POINTS: 'selecting_points',
    WAITING_FOR_LOADING: 'waiting_for_loading',
    DELIVERING: 'delivering',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed'
};

globalThis.DeliveryState = DeliveryState;   //делает переменную глобавльной