import { Workbox } from 'workbox-window';

const swRegister = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported in the browser');
    return;
  }

  try {
    const wb = new Workbox('/sw.js');
    
    await wb.register();
    console.log('Service worker registered');
    
    // Handle waiting service worker
    wb.addEventListener('waiting', () => {
      console.log('There is a new service worker available, reload the page to apply it');
    });
    
    // Setup push notification subscription
    await setupPushNotification(wb);
  } catch (error) {
    console.log('Failed to register service worker', error);
  }
};

const setupPushNotification = async (wb) => {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if push is supported
    if (!('PushManager' in window)) {
      console.log('Push notification not supported in this browser');
      return;
    }
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }
    
    // Get VAPID public key
    const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    
    // Convert VAPID key to Uint8Array
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Subscribe to push service
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
    
    console.log('Push notification subscription successful', JSON.stringify(subscription));
    
    // You can send this subscription to your server if the user is logged in
    // Example: await ApiService.subscribeNotification({ token: AuthService.getToken(), subscription });
  } catch (error) {
    console.error('Failed to setup push notification', error);
  }
};

// Convert URL base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
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
}

export default swRegister;