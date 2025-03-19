class OfflinePage {
    async render() {
      return `
        <section class="offline-page container">
          <div class="offline-content">
            <div class="offline-icon">
              <i class="fas fa-wifi-slash"></i>
            </div>
            <h1 class="offline-title">You're Offline</h1>
            <p class="offline-description">
              It seems that you're currently offline. Some features may not be available.
              Don't worry, you can still access your saved stories.
            </p>
            <div class="offline-actions">
              <a href="#/favorites" class="primary-button">View Saved Stories</a>
              <button id="retry-connection" class="secondary-button">
                <i class="fas fa-sync-alt"></i> Try Again
              </button>
            </div>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      document.title = 'Offline Mode - StoryApp';
      
      document.getElementById('retry-connection').addEventListener('click', () => {
        window.location.reload();
      });
    }
  }
  
  export default OfflinePage;