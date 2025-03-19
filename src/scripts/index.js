import '../styles/styles.css';
import App from './pages/app';
import 'regenerator-runtime';
import swRegister from './utils/sw-register';
import PushNotificationHelper from './utils/push-notification-helper';
import NotificationHelper from './utils/notification-helper';
import InstallHelper from './utils/install-helper';
import NetworkChecker from './utils/network-checker';

document.addEventListener('DOMContentLoaded', async () => {
  // Setup app
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    skipLink: document.querySelector('.skip-link'),
  });
  
  // Setup network checker
  NetworkChecker.initialize((isOnline) => {
    app.setNetworkStatus(isOnline);
    
    if (isOnline) {
      console.log('Network connection restored');
      app.showToast('You are back online!');
    } else {
      console.log('Network connection lost');
      app.showToast('You are offline. Some features may not be available.');
    }
  });
  
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
  
  // Register service worker
  await swRegister();
  
  // Initialize push notification if browser supports
  await NotificationHelper.requestPermission();
  await PushNotificationHelper.registerServiceWorker();
  await PushNotificationHelper.subscribeUserToPush();
  
  // Initialize install helper
  InstallHelper.init();
});