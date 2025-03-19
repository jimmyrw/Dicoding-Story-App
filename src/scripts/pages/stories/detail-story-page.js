import ApiService from '../../data/api-service';
import AuthService from '../../data/auth-service';
import IdbService from '../../data/idb-service';
import { showFormattedDate } from '../../utils';
import mapUtils from '../../utils/map-utils';

class DetailStoryPage {
  #id = null;
  #map = null;
  #story = null;

  constructor(id) {
    this.#id = id;
  }

  async render() {
    return `
      <section class="detail-story-page container">
        <div class="back-navigation">
          <a href="#/stories" class="back-link">
            <i class="fas fa-arrow-left"></i> Back to Stories
          </a>
        </div>
        
        <div id="story-detail-container" class="story-detail-container">
          <div class="loading-indicator">Loading story details...</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = 'Story Detail - StoryApp';
    await this._loadStoryDetail();
  }

  async _loadStoryDetail() {
    console.log('Loading story detail for ID:', this.#id);
    try {
      const token = AuthService.getToken();
      let story = null;
      
      try {
        // Coba ambil dari API dulu
        const response = await ApiService.getDetailStory({
          token,
          id: this.#id,
        });
        
        if (response.error) {
          throw new Error(response.message);
        }
        
        story = response.story;
        console.log('Story loaded from API:', story);
        
        // Simpan ke IndexedDB untuk akses offline
        await IdbService.saveStory(story);
      } catch (error) {
        console.log('Failed to fetch from API, trying IndexedDB:', error);
        // Jika gagal, coba ambil dari IndexedDB
        story = await IdbService.getStory(this.#id);
        
        if (!story) {
          throw new Error('Story not found in offline storage');
        }
        console.log('Story loaded from IndexedDB:', story);
      }
      
      this.#story = story;
      await this._renderStoryDetail(story);
      
      // Initialize map if story has location
      if (story.lat && story.lon) {
        // Wait for the DOM to update
        setTimeout(() => {
          this.#map = mapUtils.initMap('detail-story-map', {
            center: [story.lat, story.lon],
            zoom: 15,
          });
          
          // Add marker with popup
          const popupContent = `
            <div class="map-popup">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
            </div>
          `;
          
          mapUtils.addMarkerWithPopup(this.#map, story.lat, story.lon, popupContent);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to load story detail:', error);
      document.getElementById('story-detail-container').innerHTML = `
        <div class="error-message">
          <p>Failed to load story detail. ${error.message}</p>
          <button id="retry-button" class="retry-button">Retry</button>
        </div>
      `;
      
      document.getElementById('retry-button')?.addEventListener('click', () => {
        this._loadStoryDetail();
      });
    }
  }

  async _renderStoryDetail(story) {
    const storyDetailContainer = document.getElementById('story-detail-container');
    
    const hasLocation = story.lat && story.lon;
    
    let isFavorite = false;
    try {
      isFavorite = await IdbService.isFavorite(story.id);
      console.log('Story favorite status:', isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
    
    // Rendered HTML tanpa kompleksitas tambahan
    storyDetailContainer.innerHTML = `
      <article class="story-detail">
        <h1 class="story-title">${story.name}'s Story</h1>
        <p class="story-date">${showFormattedDate(story.createdAt)}</p>
        
        <div class="story-image-container">
          <img src="${story.photoUrl}" alt="${story.name}'s story" class="story-detail-image">
        </div>
        
        <div class="story-description">
          <p>${story.description}</p>
        </div>
        
        ${hasLocation ? `
          <div class="location-box">
            <h3>Location</h3>
            <p>
              <i class="fas fa-map-marker-alt"></i> 
              Latitude: ${story.lat.toFixed(6)}, Longitude: ${story.lon.toFixed(6)}
            </p>
          </div>
        ` : ''}
        
        <!-- Tombol favorit dibuat sangat sederhana -->
        <button id="favorite-button" class="btn-favorite">
          ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'} 
          <i class="${isFavorite ? 'fas' : 'far'} fa-bookmark"></i>
        </button>
        
        ${hasLocation ? `
          <div class="story-map-container">
            <h3>Story Location</h3>
            <div id="detail-story-map" class="detail-story-map"></div>
          </div>
        ` : ''}
      </article>
    `;
    
    this._setupFavoriteButton();
  }
  
  async _setupFavoriteButton() {
    console.log('Setting up favorite button');
    const favoriteButton = document.getElementById('favorite-button');
    
    if (!favoriteButton) {
      console.error('Favorite button not found in DOM');
      return;
    }
    
    favoriteButton.addEventListener('click', async (event) => {
      event.preventDefault();
      console.log('Favorite button clicked');
      
      if (!this.#story) {
        console.error('Story not available');
        return;
      }
      
      const storyId = this.#story.id;
      
      try {
        let isFavorite = await IdbService.isFavorite(storyId);
        console.log('Current favorite status:', isFavorite);
        
        if (isFavorite) {
          // Remove from favorites
          await IdbService.deleteFavorite(storyId);
          favoriteButton.innerHTML = '<i class="far fa-bookmark"></i> Add to favorites';
          this._showNotification('Removed from favorites', 'Story has been removed from your favorites');
          console.log('Removed from favorites');
        } else {
          // Add to favorites
          await IdbService.saveFavorite(this.#story);
          favoriteButton.innerHTML = '<i class="fas fa-bookmark"></i> Remove from favorites';
          this._showNotification('Added to favorites', 'Story has been added to your favorites');
          console.log('Added to favorites');
        }
      } catch (error) {
        console.error('Failed to update favorite status:', error);
        this._showNotification('Error', 'Failed to update favorites. Please try again.');
      }
    });
  }
  
  _showNotification(title, message) {
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
    
    // Show notification with animation
    setTimeout(() => {
      notificationElement.classList.add('show');
    }, 100);
    
    // Auto hide after 3 seconds
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

export default DetailStoryPage;