import IdbService from '../../data/idb-service';
import { showFormattedDate } from '../../utils';
import mapUtils from '../../utils/map-utils';

class FavoritesPage {
  #favorites = [];
  #map = null;

  async render() {
    return `
      <section class="favorites-page container">
        <h1>Favorite Stories</h1>
        
        <div class="section-options">
          <button id="show-map-button" class="option-button">
            <i class="fas fa-map-marker-alt"></i> Show Map View
          </button>
        </div>
        
        <div id="map-container" class="map-container" style="display: none;">
          <div id="favorites-map" style="height: 400px;"></div>
        </div>
        
        <div id="favorites-container" class="stories-container">
          <div id="favorites-list" class="stories-list">
            <div class="loading-indicator">Loading favorites...</div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = 'Favorite Stories - StoryApp';
    this._setupEventListeners();
    await this._loadFavorites();
  }

  _setupEventListeners() {
    document.getElementById('show-map-button').addEventListener('click', () => {
      const mapContainer = document.getElementById('map-container');
      
      if (mapContainer.style.display === 'none') {
        mapContainer.style.display = 'block';
        document.getElementById('show-map-button').innerHTML = '<i class="fas fa-list"></i> Show List View';
        
        if (!this.#map) {
          this.#map = mapUtils.initMap('favorites-map');
          mapUtils.addMarkersFromStories(this.#map, this.#favorites);
        }
      } else {
        mapContainer.style.display = 'none';
        document.getElementById('show-map-button').innerHTML = '<i class="fas fa-map-marker-alt"></i> Show Map View';
      }
    });
  }

  async _loadFavorites() {
    try {
      document.getElementById('favorites-list').innerHTML = '<div class="loading-indicator">Loading favorites...</div>';
      
      // Get favorites from IndexedDB
      this.#favorites = await IdbService.getAllFavorites();
      
      this._renderFavorites();
    } catch (error) {
      console.error('Failed to load favorites:', error);
      document.getElementById('favorites-list').innerHTML = `
        <div class="error-message">
          <p>Failed to load favorites. Please try again.</p>
          <button id="retry-button" class="retry-button">Retry</button>
        </div>
      `;
      
      document.getElementById('retry-button')?.addEventListener('click', () => {
        this._loadFavorites();
      });
    }
  }

  _renderFavorites() {
    const favoritesListElement = document.getElementById('favorites-list');
    
    if (this.#favorites.length === 0) {
      favoritesListElement.innerHTML = `
        <div class="empty-state">
          <p>No favorite stories found.</p>
          <a href="#/stories" class="add-story-button">Browse Stories</a>
        </div>
      `;
      return;
    }
    
    // Create HTML for favorites
    const favoritesHTML = this.#favorites.map((story) => `
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
            <button class="remove-favorite-button" data-id="${story.id}" aria-label="Remove from favorites">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      </article>
    `).join('');
    
    favoritesListElement.innerHTML = favoritesHTML;
    
    // Setup remove buttons
    document.querySelectorAll('.remove-favorite-button').forEach(button => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const id = event.currentTarget.dataset.id;
        
        try {
          await IdbService.deleteFavorite(id);
          alert('Story removed from favorites');
          this._loadFavorites();
        } catch (error) {
          console.error('Failed to remove favorite:', error);
          alert('Failed to remove from favorites');
        }
      });
    });
  }
}

export default FavoritesPage;