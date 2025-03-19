import routes, { checkAuth } from '../routes/routes';
import { getActiveRoute, parseActivePathname, getActivePathname } from '../routes/url-parser';
import ViewTransitionUtils from '../utils/view-transition-utils';
import AuthService from '../data/auth-service';
import NetworkChecker from '../utils/network-checker';
import OfflinePage from '../pages/offline/offline-page';
import NotFoundPage from '../pages/not-found/not-found-page';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLink = null;
  #isOnline = true;

  constructor({ navigationDrawer, drawerButton, content, skipLink }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLink = skipLink;
    this.#isOnline = NetworkChecker.isOnline();

    this._setupDrawer();
    this._setupSkipLink();
    this._updateNavigation();
    this._setupNetworkListener();
    ViewTransitionUtils.setupPageTransition();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _setupSkipLink() {
    this.#skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.#content.setAttribute('tabindex', '-1');
      this.#content.focus();
    });

    this.#content.addEventListener('blur', () => {
      this.#content.removeAttribute('tabindex');
    });
  }
  
  _setupNetworkListener() {
    NetworkChecker.initialize((isOnline) => {
      this.#isOnline = isOnline;
      
      if (isOnline) {
        // Jika kembali online dan berada di halaman offline, redirect ke home
        if (getActivePathname() === '/offline') {
          window.location.hash = '#/';
        }
        
        // Tampilkan notifikasi online
        this._showNotification('Back Online', 'You are now connected to the network.');
      } else {
        // Jika offline, redirect ke halaman offline
        window.location.hash = '#/offline';
        
        // Tampilkan notifikasi offline
        this._showNotification('You are Offline', 'Some features may not be available.');
      }
    });
  }
  
  async _showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/images/icons/icon-192x192.png',
      });
    } else {
      // Fallback jika notifikasi tidak diizinkan
      const notificationElement = document.createElement('div');
      notificationElement.classList.add('app-notification');
      notificationElement.innerHTML = `
        <div class="notification-content">
          <h3>${title}</h3>
          <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
      `;
      
      document.body.appendChild(notificationElement);
      
      // Tampilkan dengan animasi
      setTimeout(() => {
        notificationElement.classList.add('show');
      }, 100);
      
      // Auto hide setelah 3 detik
      setTimeout(() => {
        notificationElement.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notificationElement);
        }, 300);
      }, 3000);
      
      // Setup close button
      notificationElement.querySelector('.notification-close').addEventListener('click', () => {
        notificationElement.classList.remove('show');
        setTimeout(() => {
          document.body.removeChild(notificationElement);
        }, 300);
      });
    }
  }

  _updateNavigation() {
    const navList = document.getElementById('nav-list');
    const isLoggedIn = AuthService.isLoggedIn();
    
    // Update navigation based on authentication status
    if (isLoggedIn) {
      const user = AuthService.getUser();
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/stories">Stories</a></li>
        <li><a href="#/stories/add">Add Story</a></li>
        <li><a href="#/favorites">Favorites</a></li>
        <li><a href="#/about">About</a></li>
        <li><span>Hi, ${user.name}</span></li>
        <li><a href="#" id="logout-button">Logout</a></li>
      `;

      document.getElementById('logout-button').addEventListener('click', (event) => {
        event.preventDefault();
        AuthService.logout();
      });
    } else {
      navList.innerHTML = `
        <li><a href="#/">Beranda</a></li>
        <li><a href="#/about">About</a></li>
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Register</a></li>
      `;
    }
  }

  async renderPage() {
    await ViewTransitionUtils.transitionPage(async () => {
      // Handle special routes like offline and not-found
      const pathname = getActivePathname();
      
      // Khusus handle halaman offline
      if (pathname === '/offline') {
        const offlinePage = new OfflinePage();
        this.#content.innerHTML = await offlinePage.render();
        await offlinePage.afterRender();
        this._updateNavigation();
        return;
      }
      
      // Redirect ke offline jika tidak ada koneksi dan halaman bukan halaman publik
      if (!this.#isOnline && !['/', '/about', '/login', '/register', '/favorites', '/offline', '/not-found'].includes(pathname)) {
        window.location.hash = '#/offline';
        return;
      }
      
      const url = getActiveRoute();
      
      if (!checkAuth(url)) {
        return;
      }

      let page;
      // Check if the route is a function (for dynamic routes)
      if (typeof routes[url] === 'function') {
        const params = parseActivePathname();
        page = routes[url](params.id);
      } else {
        page = routes[url];
      }

      if (!page) {
        if (pathname === '/not-found') {
          const notFoundPage = new NotFoundPage();
          this.#content.innerHTML = await notFoundPage.render();
          await notFoundPage.afterRender();
        } else {
          window.location.hash = '#/not-found';
          return;
        }
      } else {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      }
      
      this._updateNavigation();
    });
  }
}

export default App;