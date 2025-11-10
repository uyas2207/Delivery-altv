import * as chat from 'alt:chat';

export class DeliveryCommands {
    static register(deliverySystem) {
    //единственный способ начать доставку /randomload
        chat.registerCmd("randomload", (player) => {
            deliverySystem.startNewOrder(player);
        });
        chat.registerCmd("cancelorder", (player) => {
            deliverySystem.cancelOrder(player);
        });
    }
}