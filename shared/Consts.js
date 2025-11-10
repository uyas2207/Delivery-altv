// значение DeliveryState для клиента и сервера
export const DeliveryState = {
    EMPTY: 'empty',  //'empty'			нет активного заказа (провален или выполнен)
    WAITING_FOR_LOADING: 'waiting_for_loading', //'waiting_for_loading'	после старта доставки (когда активна точка погрузки)
    DELIVERING: 'delivering',   //'delivering'		после момента погрузки до момента разгрузки (активна точка разгрузки)
};
//globalThis.DeliveryState = DeliveryState;   //делает переменную глобавльной