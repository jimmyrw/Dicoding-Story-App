// src/scripts/utils/notification-helper.js
const NotificationHelper = {
    async requestPermission() {
      if (!('Notification' in window)) {
        console.log('Browser tidak mendukung notifikasi');
        return;
      }
  
      const result = await Notification.requestPermission();
      if (result === 'denied') {
        console.log('Fitur notifikasi tidak diijinkan');
        return;
      }
  
      if (result === 'default') {
        console.log('Pengguna menutup kotak dialog permintaan ijin');
        return;
      }
  
      console.log('Fitur notifikasi diijinkan');
    },
  
    async showNotification({ title, options }) {
      if (!('Notification' in window)) {
        console.log('Browser tidak mendukung notifikasi');
        return;
      }
  
      if (Notification.permission !== 'granted') {
        console.log('User belum memberikan izin notifikasi');
        return;
      }
  
      const serviceWorkerRegistration = await navigator.serviceWorker.ready;
      serviceWorkerRegistration.showNotification(title, options);
    },
  };
  
  export default NotificationHelper;