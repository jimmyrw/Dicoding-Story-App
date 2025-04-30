// src/scripts/utils/push-notification-helper.js
import CONFIG from '../config';
import ApiService from '../data/api-service';
import AuthService from '../data/auth-service';

const PushNotificationHelper = {
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        console.error('Service worker registration failed:', error);
        return null;
      }
    }
    console.error('Service worker not supported in this browser');
    return null;
  },

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return null;
    }

    const result = await Notification.requestPermission();
    if (result !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    return result;
  },

  async subscribeUserToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Konversi VAPID key yang benar
      const vapidPublicKey = CONFIG.VAPID_PUBLIC_KEY;
      const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);
      
      // Subscribe user
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
      
      // Kirim subscription ke server jika user sudah login
      if (AuthService.isLoggedIn()) {
        const token = AuthService.getToken();
        
        const formattedSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          },
        };
        
        await ApiService.subscribeNotification({
          token,
          subscription: formattedSubscription
        });
        
        console.log('Successfully subscribed to push notifications API');
      } else {
        console.log('User not logged in, skipping API subscription');
      }
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  },
  
  async unsubscribeFromPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        return true;
      }
      
      // Unsubscribe dari PushManager
      const success = await subscription.unsubscribe();
      
      // Unsubscribe dari API jika user login
      if (success && AuthService.isLoggedIn()) {
        const token = AuthService.getToken();
        await ApiService.unsubscribeNotification({
          token,
          endpoint: subscription.endpoint,
        });
        
        console.log('Successfully unsubscribed from push notifications API');
      }
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      return false;
    }
  },
  
  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  },
};

export default PushNotificationHelper;