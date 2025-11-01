import * as alt from 'alt-client';
import * as native from "natives";

// Централизованный менеджер уведомлений на клиенте
class NotificationManager {
    static instance = null;
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new NotificationManager();
        }
        return this.instance;
    }

    constructor() {
        if (NotificationManager.instance) {
            return NotificationManager.instance;
        }
        
        this.webView = null;
        this.isInitialized = false;
        this.isWebViewOpen = false;

        // регистрация обработчика серверных уведомлений
        alt.onServer('notification.notify', (message, autoHide = false) => {
            this.drawNotification(message, autoHide);
        });

        NotificationManager.instance = this;
    }
    
    // Основной метод для показа уведомлений
    drawNotification(message, autoHide = false) {
        native.beginTextCommandThefeedPost('STRING');
        native.addTextComponentSubstringPlayerName(message);
        const notificationId = native.endTextCommandThefeedPostTicker(false, false);
        
        if (autoHide) {
            setTimeout(() => {
                native.thefeedRemoveItem(notificationId);
            }, 3000);
        }
    }
    
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        await this.init();
    }

    async init() {
        this.webView = new alt.WebView('http://resource/client/html/index.html');

        const loadPromise = new Promise((resolve) => {
            this.webView.once('load', () => resolve(true));
        });
        
        const timeoutPromise = new Promise((resolve) => {
            alt.setTimeout(() => resolve(false), 2000);
        });
        
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
        } else {
            alt.log('Попытка скрыть Notification при isInitialized === null');
            this.isWebViewOpen = false;
        }
    }
}
export default NotificationManager;