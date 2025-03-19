// src/scripts/routes/routes.js
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import StoriesPage from '../pages/stories/stories-page';
import AddStoryPage from '../pages/stories/add-story-page';
import DetailStoryPage from '../pages/stories/detail-story-page';
import FavoritesPage from '../pages/favorites/favorites-page';
import NotFoundPage from '../pages/not-found/not-found-page';
import OfflinePage from '../pages/offline/offline-page';
import AuthService from '../data/auth-service';
import DebugPage from '../pages/debug/debug-page';

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/stories': new StoriesPage(),
  '/stories/add': new AddStoryPage(),
  '/stories/:id': (id) => new DetailStoryPage(id),
  '/favorites': new FavoritesPage(),
  '/not-found': new NotFoundPage(),
  '/debug': new DebugPage(),
  '/offline': new OfflinePage(),
};

// Route middleware to check authentication
const restrictedRoutes = ['/stories', '/stories/add', '/stories/:id'];

export function checkAuth(route) {
  if (restrictedRoutes.includes(route) && !AuthService.isLoggedIn()) {
    window.location.hash = '#/login';
    return false;
  }
  return true;
}

export default routes;