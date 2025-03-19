class DebugPage {
    async render() {
      return `
        <section class="debug-page container">
          <h1>PWA Debug Information</h1>
          
          <div class="debug-section">
            <h2>Service Worker</h2>
            <div id="sw-status">Checking...</div>
            <button id="check-sw-button" class="debug-button">Check Service Worker</button>
            <button id="unregister-sw-button" class="debug-button danger">Unregister Service Worker</button>
          </div>
          
          <div class="debug-section">
            <h2>Web App Manifest</h2>
            <div id="manifest-status">Checking...</div>
            <button id="check-manifest-button" class="debug-button">Check Manifest</button>
          </div>
          
          <div class="debug-section">
            <h2>Install Status</h2>
            <div id="install-status">Checking...</div>
            <button id="trigger-install-button" class="debug-button">Trigger Install Prompt</button>
          </div>
          
          <div class="debug-section">
            <h2>Network Status</h2>
            <div id="network-status">Checking...</div>
            <button id="check-network-button" class="debug-button">Check Network</button>
          </div>
          
          <div class="debug-section">
            <h2>Cache Storage</h2>
            <div id="cache-status">Checking...</div>
            <button id="check-cache-button" class="debug-button">Check Cache</button>
            <button id="clear-cache-button" class="debug-button danger">Clear All Caches</button>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      document.title = 'PWA Debug - StoryApp';
      
      // Check Service Worker
      document.getElementById('check-sw-button').addEventListener('click', this._checkServiceWorker);
      document.getElementById('unregister-sw-button').addEventListener('click', this._unregisterServiceWorker);
      
      // Check Manifest
      document.getElementById('check-manifest-button').addEventListener('click', this._checkManifest);
      
      // Check Install Status
      document.getElementById('trigger-install-button').addEventListener('click', this._triggerInstall);
      
      // Check Network
      document.getElementById('check-network-button').addEventListener('click', this._checkNetwork);
      
      // Check Cache
      document.getElementById('check-cache-button').addEventListener('click', this._checkCache);
      document.getElementById('clear-cache-button').addEventListener('click', this._clearCache);
      
      // Run initial checks
      this._checkServiceWorker();
      this._checkManifest();
      this._checkInstallStatus();
      this._checkNetwork();
      this._checkCache();
    }
    
    _checkServiceWorker() {
      const statusEl = document.getElementById('sw-status');
      
      if (!('serviceWorker' in navigator)) {
        statusEl.innerHTML = `<div class="status-error">Service Worker not supported</div>`;
        return;
      }
      
      navigator.serviceWorker.getRegistration()
        .then(registration => {
          if (registration) {
            statusEl.innerHTML = `
              <div class="status-success">Service Worker registered</div>
              <div class="details">
                <p>Scope: ${registration.scope}</p>
                <p>Update State: ${registration.updateViaCache}</p>
                <p>Active: ${registration.active ? 'Yes' : 'No'}</p>
              </div>
            `;
          } else {
            statusEl.innerHTML = `<div class="status-warning">No Service Worker registered</div>`;
          }
        })
        .catch(error => {
          statusEl.innerHTML = `<div class="status-error">Error checking Service Worker: ${error.message}</div>`;
        });
    }
    
    _unregisterServiceWorker() {
      const statusEl = document.getElementById('sw-status');
      
      if (!('serviceWorker' in navigator)) {
        statusEl.innerHTML = `<div class="status-error">Service Worker not supported</div>`;
        return;
      }
      
      navigator.serviceWorker.getRegistration()
        .then(registration => {
          if (registration) {
            return registration.unregister();
          }
          return false;
        })
        .then(success => {
          if (success) {
            statusEl.innerHTML = `<div class="status-success">Service Worker unregistered</div>`;
          } else {
            statusEl.innerHTML = `<div class="status-warning">No Service Worker to unregister</div>`;
          }
        })
        .catch(error => {
          statusEl.innerHTML = `<div class="status-error">Error unregistering Service Worker: ${error.message}</div>`;
        });
    }
    
    _checkManifest() {
      const statusEl = document.getElementById('manifest-status');
      
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (!manifestLink) {
        statusEl.innerHTML = `<div class="status-error">No manifest link found in the document</div>`;
        return;
      }
      
      fetch(manifestLink.href)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(manifest => {
          statusEl.innerHTML = `
            <div class="status-success">Manifest loaded successfully</div>
            <div class="details">
              <p>Name: ${manifest.name}</p>
              <p>Short Name: ${manifest.short_name}</p>
              <p>Start URL: ${manifest.start_url}</p>
              <p>Display: ${manifest.display}</p>
              <p>Icons: ${manifest.icons ? manifest.icons.length : 0} icons defined</p>
            </div>
          `;
        })
        .catch(error => {
          statusEl.innerHTML = `<div class="status-error">Error loading manifest: ${error.message}</div>`;
        });
    }
    
    _checkInstallStatus() {
      const statusEl = document.getElementById('install-status');
      
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        statusEl.innerHTML = `<div class="status-success">App is installed and running in standalone mode</div>`;
      } else {
        statusEl.innerHTML = `<div class="status-info">App is running in browser mode (not installed)</div>`;
      }
    }
    
    _triggerInstall() {
      const statusEl = document.getElementById('install-status');
      
      if (window.InstallHelper && window.InstallHelper.promptInstall) {
        window.InstallHelper.promptInstall();
        statusEl.innerHTML = `<div class="status-info">Install prompt triggered</div>`;
      } else {
        statusEl.innerHTML = `<div class="status-warning">Install Helper not available</div>`;
      }
    }
    
    _checkNetwork() {
      const statusEl = document.getElementById('network-status');
      
      if (navigator.onLine) {
        statusEl.innerHTML = `<div class="status-success">Online</div>`;
      } else {
        statusEl.innerHTML = `<div class="status-warning">Offline</div>`;
      }
    }
    
    async _checkCache() {
      const statusEl = document.getElementById('cache-status');
      
      try {
        const cacheNames = await caches.keys();
        
        if (cacheNames.length === 0) {
          statusEl.innerHTML = `<div class="status-warning">No caches found</div>`;
          return;
        }
        
        let cachesHTML = '';
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          
          cachesHTML += `
            <div class="cache-item">
              <p><strong>${cacheName}</strong>: ${keys.length} items</p>
            </div>
          `;
        }
        
        statusEl.innerHTML = `
          <div class="status-success">${cacheNames.length} caches found</div>
          <div class="details">
            ${cachesHTML}
          </div>
        `;
      } catch (error) {
        statusEl.innerHTML = `<div class="status-error">Error checking caches: ${error.message}</div>`;
      }
    }
    
    async _clearCache() {
      const statusEl = document.getElementById('cache-status');
      
      try {
        const cacheNames = await caches.keys();
        
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        
        statusEl.innerHTML = `<div class="status-success">All caches cleared</div>`;
      } catch (error) {
        statusEl.innerHTML = `<div class="status-error">Error clearing caches: ${error.message}</div>`;
      }
    }
  }
  
  export default DebugPage;