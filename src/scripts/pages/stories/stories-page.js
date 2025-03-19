import ApiService from '../../data/api-service';
import AuthService from '../../data/auth-service';
import IdbService from '../../data/idb-service';
import { showFormattedDate } from '../../utils';
import mapUtils from '../../utils/map-utils';
import NetworkChecker from '../../utils/network-checker';

class StoriesPage {
  #stories = [];
  #page = 1;
  #totalPages = 1;
  #isLoading = false;
  #map = null;

  async render() {
    return `
      <section class="stories-page container">
        <h1>Stories</h1>
        
        <div class="section-options">
          <button id="show-map-button" class="option-button">
            <i class="fas fa-map-marker-alt"></i> Show Map View
          </button>
          <a href="#/stories/add" class="add-story-button">
            <i class="fas fa-plus"></i> Add New Story
          </a>
        </div>
        
        <div id="map-container" class="map-container" style="display: none;">
          <div id="stories-map" style="height: 400px;"></div>
        </div>
        
        <div id="stories-container" class="stories-container">
          <div id="stories-list" class="stories-list">
            <div class="loading-indicator">Loading stories...</div>
          </div>
          
          <div id="load-more-container" class="load-more-container" style="display: none;">
            <button id="load-more-button" class="load-more-button">Load More</button>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = 'Stories - StoryApp';
    this._setupEventListeners();
    await this._loadStories();
  }

  _setupEventListeners() {
    document.getElementById('show-map-button').addEventListener('click', () => {
      const mapContainer = document.getElementById('map-container');
      
      if (mapContainer.style.display === 'none') {
        mapContainer.style.display = 'block';
        document.getElementById('show-map-button').innerHTML = '<i class="fas fa-list"></i> Show List View';
        
        // Initialize map if not already done
        if (!this.#map) {
          this.#map = mapUtils.initMap('stories-map');
          mapUtils.addMarkersFromStories(this.#map, this.#stories);
        }
      } else {
        mapContainer.style.display = 'none';
        document.getElementById('show-map-button').innerHTML = '<i class="fas fa-map-marker-alt"></i> Show Map View';
      }
    });

    document.getElementById('load-more-button')?.addEventListener('click', async () => {
      if (this.#page < this.#totalPages && !this.#isLoading) {
        this.#page++;
        await this._loadStories(false);
      }
    });
  }

  async _loadStories(resetList = true) {
    this.#isLoading = true;
    
    try {
      const token = AuthService.getToken();
      
      if (resetList) {
        this.#page = 1;
        document.getElementById('stories-list').innerHTML = '<div class="loading-indicator">Loading stories...</div>';
      } else {
        document.getElementById('load-more-button').innerHTML = 'Loading...';
        document.getElementById('load-more-button').disabled = true;
      }
      
      let listStory = [];
      const isOnline = NetworkChecker.isOnline();
      
      if (isOnline) {
        try {
          // Coba dapatkan data dari API jika online
          const response = await ApiService.getAllStories({
            token,
            page: this.#page,
            size: 10,
            location: 1, // Get stories with location
          });
          
          if (response.error) {
            throw new Error(response.message);
          }
          
          listStory = response.listStory;
          
          // Simpan ke IndexedDB untuk akses offline
          if (listStory.length > 0) {
            await IdbService.saveStories(listStory);
          }
        } catch (error) {
          console.error('API Error:', error);
          // Jika gagal mengambil dari API, coba dari IndexedDB
          listStory = await IdbService.getAllStories();
        }
      } else {
        // Jika offline, langsung ambil dari IndexedDB
        listStory = await IdbService.getAllStories();
      }
      
      if (listStory.length === 0) {
        throw new Error(isOnline ? 'No stories available' : 'No stories available offline');
      }
      
      if (resetList) {
        this.#stories = listStory;
      } else {
        this.#stories = [...this.#stories, ...listStory];
      }
      
      // Render stories
      this._renderStories();
      
      // Calculate total pages (assuming 10 items per page)
      this.#totalPages = Math.ceil(this.#stories.length / 10) + (listStory.length === 10 ? 1 : 0);
      
      // Show/hide load more button
      const loadMoreContainer = document.getElementById('load-more-container');
      if (loadMoreContainer) {
        if (this.#page < this.#totalPages) {
          loadMoreContainer.style.display = 'block';
        } else {
          loadMoreContainer.style.display = 'none';
        }
      }
      
      // Update map markers if map is initialized
      if (this.#map) {
        // Clear existing markers
        this.#map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            this.#map.removeLayer(layer);
          }
        });
        
        // Add new markers
        mapUtils.addMarkersFromStories(this.#map, this.#stories);
      }
    } catch (error) {
      console.error('Failed to load stories:', error);
      document.getElementById('stories-list').innerHTML = `
        <div class="error-message">
          <p>Failed to load stories. ${error.message}</p>
          <button id="retry-button" class="retry-button">Retry</button>
        </div>
      `;
      
      document.getElementById('retry-button').addEventListener('click', () => {
        this._loadStories();
      });
    } finally {
      this.#isLoading = false;
      const loadMoreButton = document.getElementById('load-more-button');
      if (loadMoreButton) {
        loadMoreButton.disabled = false;
        loadMoreButton.innerHTML = 'Load More';
      }
    }
  }

  _renderStories() {
    const storiesListElement = document.getElementById('stories-list');
    
    if (!storiesListElement) {
      console.error('stories-list element not found');
      return;
    }
    
    if (this.#stories.length === 0) {
      storiesListElement.innerHTML = `
        <div class="empty-state">
          <p>No stories found.</p>
          <a href="#/stories/add" class="add-story-button">Add Your First Story</a>
        </div>
      `;
      return;
    }
    
    // Create HTML for stories
    const storiesHTML = this.#stories.map((story) => `
      <article class="story-item" data-id="${story.id}">
        <div class="story-image-container">
          <img src="${story.photoUrl}" alt="${story.name}'s story" class="story-image">
        </div>
        <div class="story-content">
          <h3 class="story-title">${story.name}'s Story</h3>
          <p class="story-date">${showFormattedDate(story.createdAt)}</p>
          <p class="story-description">${story.description}</p>
          ${story.lat && story.lon ? `
            <p class="story-location">
              <i class="fas fa-map-marker-alt"></i> Location: ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}
            </p>
          ` : ''}
          <div class="story-actions">
            <a href="#/stories/${story.id}" class="story-detail-link" aria-label="View details of ${story.name}'s story">
              View Details
            </a>
            <button class="favorite-button" data-id="${story.id}" aria-label="Add to favorites">
              <i class="far fa-bookmark"></i>
            </button>
          </div>
        </div>
      </article>
    `).join('');
    
    storiesListElement.innerHTML = storiesHTML;
    
    // Setup favorite buttons
    this._setupFavoriteButtons();
  }
  
  async _setupFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-button');
    
    for (const button of favoriteButtons) {
      const storyId = button.dataset.id;
      const isFavorite = await IdbService.isFavorite(storyId);
      
      // Update button appearance
      if (isFavorite) {
        button.innerHTML = '<i class="fas fa-bookmark"></i>';
        button.setAttribute('aria-label', 'Remove from favorites');
      } else {
        button.innerHTML = '<i class="far fa-bookmark"></i>';
        button.setAttribute('aria-label', 'Add to favorites');
      }
      
      // Add click handler
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const story = this.#stories.find(s => s.id === storyId);
        
        if (!story) return;
        
        if (await IdbService.isFavorite(storyId)) {
          await IdbService.deleteFavorite(storyId);
          button.innerHTML = '<i class="far fa-bookmark"></i>';
          button.setAttribute('aria-label', 'Add to favorites');
          this._showNotification('Removed from favorites', 'Story has been removed from your favorites');
        } else {
          await IdbService.saveFavorite(story);
          button.innerHTML = '<i class="fas fa-bookmark"></i>';
          button.setAttribute('aria-label', 'Remove from favorites');
          this._showNotification('Added to favorites', 'Story has been added to your favorites');
        }
      });
    }
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

export default StoriesPage;