// менеджер уведомлений на сервере
import * as alt from 'alt-server';

export class NotificationManager {
    static showNotify(player, text, autoHide = false) {
        alt.emitClient(player, 'notification.notify', text, autoHide);
    }
}