import { defineStore } from 'pinia';
import { localStg } from '@/utils/storage';

interface AlarmPushState {
  notifications: Api.Alarm.AlarmPush[];
  websocket: WebSocket | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  isConnected: boolean;
}

export const useAlarmPushStore = defineStore('alarm-push', {
  state: (): AlarmPushState => ({
    notifications: [],
    websocket: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    isConnected: false
  }),

  getters: {
    hasNotifications: state => state.notifications.length > 0
  },

  actions: {
    addNotification(notification: Api.Alarm.AlarmPush) {
      const existingIndex = this.notifications.findIndex((n: Api.Alarm.AlarmPush) => n.alarmId === notification.alarmId);
      if (existingIndex !== -1) {
        this.notifications[existingIndex] = notification;
      } else {
        this.notifications.push(notification);
      }
    },

    removeNotification(alarmId: number) {
      const index = this.notifications.findIndex((n: Api.Alarm.AlarmPush) => n.alarmId === alarmId);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },

    clearNotifications() {
      this.notifications = [];
    },

    connectWebSocket() {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        return;
      }

      const token = localStg.get('token');
      if (!token) {
        return;
      }

      const baseUrl = import.meta.env.VITE_SERVICE_BASE_URL;

      let wsUrl: string;
      if (baseUrl) {
        const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
        const wsHost = baseUrl.replace(/^https?:\/\//, '');
        wsUrl = `${wsProtocol}://${wsHost}/ws/alarm?token=${token}`;
      } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        wsUrl = `${protocol}//${host}/ws/alarm?token=${token}`;
      }

      try {
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
          console.log('Alarm WebSocket connected');
          this.reconnectAttempts = 0;
          this.isConnected = true;
        };

        this.websocket.onmessage = event => {
          try {
            const data: Api.Alarm.AlarmPush = JSON.parse(event.data);
            this.addNotification(data);
          } catch {
            // parse error, ignore
          }
        };

        this.websocket.onerror = () => {
          // WebSocket error, ignore
        };

        this.websocket.onclose = () => {
          this.websocket = null;
          this.isConnected = false;
          this.reconnectAttempts += 1;
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
            setTimeout(() => {
              this.connectWebSocket();
            }, delay);
          }
        };
      } catch {
        // create WebSocket error, ignore
      }
    },

    disconnectWebSocket() {
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
        this.isConnected = false;
      }
    }
  }
});
