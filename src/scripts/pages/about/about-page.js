import PushNotificationHelper from '../../utils/push-notification-helper';

export default class AboutPage {
  async render() {
    return `
      <section class="about-page container">
        <h1 class="about-title">About StoryApp</h1>
        
        <div class="about-content">
          <div class="app-description">
            <h2>Selamat Datang di StoryApp</h2>
            <p>StoryApp adalah platform berbagi cerita dan pengalaman untuk komunitas Dicoding. Aplikasi ini dibuat sebagai submission untuk kelas Dicoding "Menjadi Front-End Web Developer Expert".</p>
            
            <p>Dengan StoryApp, Anda dapat:</p>
            <ul>
              <li>Berbagi cerita dan pengalaman Anda dengan foto</li>
              <li>Menambahkan lokasi pada cerita Anda</li>
              <li>Melihat cerita dari pengguna lain</li>
              <li>Melihat lokasi cerita pada peta</li>
            </ul>
          </div>
          
          <div class="tech-stack">
            <h2>Teknologi yang Digunakan</h2>
            <ul>
              <li>HTML, CSS, dan JavaScript</li>
              <li>Single Page Application dengan teknik hash routing</li>
              <li>Model-View-Presenter (MVP) pattern</li>
              <li>Leaflet.js untuk integrasi peta</li>
              <li>Web Camera API untuk pengambilan gambar</li>
              <li>View Transition API untuk transisi halaman yang halus</li>
              <li>Service Worker dan Workbox untuk offline experience</li>
            </ul>
          </div>
          
          <div class="developer-info">
            <h2>Dikembangkan Oleh</h2>
            <p>Nama: Esteh</p>
            <p>Kelas: Front-End Web Developer Expert</p>
          </div>
          
          <div class="notification-section">
            <h2>Notification Settings</h2>
            <p>Enable push notifications to stay updated with new stories.</p>
            
            <div class="notification-actions">
              <button id="subscribe-button" class="primary-button">
                <i class="fas fa-bell"></i> Subscribe to Notifications
              </button>
              
              <button id="unsubscribe-button" class="secondary-button">
                <i class="fas fa-bell-slash"></i> Unsubscribe from Notifications
              </button>
            </div>
            
            <div id="notification-status" class="notification-status mt-3"></div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = 'About StoryApp';
    
    // Setup notification buttons
    this._setupNotificationButtons();
    
    // Check current subscription status
    this._checkSubscriptionStatus();
  }
  
  async _setupNotificationButtons() {
    const subscribeButton = document.getElementById('subscribe-button');
    const unsubscribeButton = document.getElementById('unsubscribe-button');
    const statusContainer = document.getElementById('notification-status');
    
    if (!subscribeButton || !unsubscribeButton || !statusContainer) {
      console.error('Notification elements not found');
      return;
    }
    
    subscribeButton.addEventListener('click', async () => {
      try {
        statusContainer.innerHTML = '<p class="loading">Requesting permission...</p>';
        
        // Request permission
        const permission = await PushNotificationHelper.requestPermission();
        if (!permission) {
          statusContainer.innerHTML = '<p class="error">Permission denied. Please enable notifications in your browser settings.</p>';
          return;
        }
        
        // Subscribe to push
        statusContainer.innerHTML = '<p class="loading">Subscribing to notifications...</p>';
        const subscription = await PushNotificationHelper.subscribeUserToPush();
        
        if (subscription) {
          statusContainer.innerHTML = '<p class="success">Successfully subscribed to notifications!</p>';
          this._checkSubscriptionStatus();
        } else {
          statusContainer.innerHTML = '<p class="error">Failed to subscribe to notifications. Please try again.</p>';
        }
      } catch (error) {
        console.error('Error subscribing to notifications:', error);
        statusContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
      }
    });
    
    unsubscribeButton.addEventListener('click', async () => {
      try {
        statusContainer.innerHTML = '<p class="loading">Unsubscribing from notifications...</p>';
        
        const success = await PushNotificationHelper.unsubscribeFromPush();
        
        if (success) {
          statusContainer.innerHTML = '<p class="success">Successfully unsubscribed from notifications.</p>';
          this._checkSubscriptionStatus();
        } else {
          statusContainer.innerHTML = '<p class="error">Failed to unsubscribe from notifications.</p>';
        }
      } catch (error) {
        console.error('Error unsubscribing from notifications:', error);
        statusContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
      }
    });
  }
  
  async _checkSubscriptionStatus() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notification not supported');
      return;
    }
    
    const subscribeButton = document.getElementById('subscribe-button');
    const unsubscribeButton = document.getElementById('unsubscribe-button');
    const statusContainer = document.getElementById('notification-status');
    
    if (!subscribeButton || !unsubscribeButton) {
      return;
    }
    
    try {
      // Check if browser supports notification
      if (!('Notification' in window)) {
        subscribeButton.disabled = true;
        unsubscribeButton.disabled = true;
        statusContainer.innerHTML = '<p class="error">Your browser does not support notifications</p>';
        return;
      }
      
      // Check current permission
      if (Notification.permission === 'denied') {
        subscribeButton.disabled = true;
        unsubscribeButton.disabled = true;
        statusContainer.innerHTML = '<p class="error">Notification permission denied. Please enable in your browser settings.</p>';
        return;
      }
      
      // Check if already subscribed
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        subscribeButton.disabled = true;
        unsubscribeButton.disabled = false;
        statusContainer.innerHTML = '<p class="success">You are currently subscribed to notifications</p>';
      } else {
        subscribeButton.disabled = false;
        unsubscribeButton.disabled = true;
        statusContainer.innerHTML = '<p class="info">You are not subscribed to notifications</p>';
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      statusContainer.innerHTML = `<p class="error">Error checking notification status: ${error.message}</p>`;
    }
  }
}