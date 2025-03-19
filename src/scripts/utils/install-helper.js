const InstallHelper = {
  deferredPrompt: null,
  
  init() {
    // Tambahkan tombol "Install App" di halaman
    this._addInstallButton();
    
    // Tangkap event beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      // Cegah Chrome versi < 76 menampilkan prompt otomatis
      e.preventDefault();
      
      // Simpan event untuk digunakan nanti
      this.deferredPrompt = e;
      
      // Tampilkan UI install Anda sendiri
      const installButton = document.getElementById('install-pwa-button');
      if (installButton) {
        installButton.style.display = 'block';
      }
      
      // Atau tampilkan banner install
      this._showInstallBanner();
    });
    
    // Tangkap event appinstalled
    window.addEventListener('appinstalled', (event) => {
      console.log('App was installed', event);
      // Sembunyikan UI install
      this._hideInstallUI();
    });
  },
  
  _addInstallButton() {
    // Tambahkan button di header atau footer
    const header = document.querySelector('.main-header');
    if (header) {
      const installButton = document.createElement('button');
      installButton.id = 'install-pwa-button';
      installButton.className = 'install-app-button';
      installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
      installButton.style.display = 'none'; // Sembunyikan dulu
      
      // Tambahkan event listener
      installButton.addEventListener('click', () => {
        this.promptInstall();
      });
      
      header.appendChild(installButton);
    }
  },
  
  _showInstallBanner() {
    const banner = document.getElementById('install-app');
    if (banner) {
      banner.style.display = 'block';
      
      // Setup tombol install di banner
      const installButton = document.getElementById('install-button');
      if (installButton) {
        installButton.addEventListener('click', () => {
          this.promptInstall();
        });
      }
      
      // Setup tombol close
      const closeButton = document.getElementById('close-install');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          banner.style.display = 'none';
          localStorage.setItem('install-banner-dismissed', 'true');
        });
      }
    }
  },
  
  _hideInstallUI() {
    // Sembunyikan tombol install
    const installButton = document.getElementById('install-pwa-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
    
    // Sembunyikan banner
    const banner = document.getElementById('install-app');
    if (banner) {
      banner.style.display = 'none';
    }
  },
  
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('Installation prompt not available');
      this._showInstallInstructions();
      return;
    }
    
    // Tampilkan prompt
    this.deferredPrompt.prompt();
    
    // Tunggu user merespons prompt
    const { outcome } = await this.deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // Reset deferredPrompt untuk digunakan nanti
    this.deferredPrompt = null;
    
    // Sembunyikan UI install
    this._hideInstallUI();
  },
  
  _showInstallInstructions() {
    // Tampilkan instruksi manual untuk install jika browser support tidak ada
    alert('To install this app:\n\n' +
          'In Chrome/Edge: Click the three-dot menu > "Install app"\n' +
          'In Safari iOS: Click the share button > "Add to Home Screen"\n' +
          'In Firefox: Click the three-dot menu > "Install"');
  }
};

export default InstallHelper;