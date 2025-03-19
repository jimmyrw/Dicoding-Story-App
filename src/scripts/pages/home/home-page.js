import ApiService from '../../data/api-service';
import { showFormattedDate } from '../../utils';
import AuthService from '../../data/auth-service';

class HomePage {
  async render() {
    return `
      <section class="hero-section">
        <div class="hero-content container">
          <h1>Share Your Stories</h1>
          <p>Capture and share your special moments with the Dicoding community</p>
          
          <div class="hero-actions">
            ${AuthService.isLoggedIn() 
              ? '<a href="#/stories/add" class="cta-button">Create New Story</a>'
              : '<a href="#/register" class="cta-button">Get Started</a>'}
            <a href="#/stories" class="secondary-button">Browse Stories</a>
          </div>
        </div>
      </section>
      
      <section class="featured-stories container">
        <h2>Featured Stories</h2>
        
        <div id="featured-stories-list" class="featured-stories-list">
          <div class="loading-indicator">Loading featured stories...</div>
        </div>
      </section>
      
      <section class="features-section container">
        <h2>Our Features</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-camera"></i>
            </div>
            <h3>Capture</h3>
            <p>Take photos directly with your camera</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <h3>Locate</h3>
            <p>Share your location with your stories</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-share-alt"></i>
            </div>
            <h3>Share</h3>
            <p>Share your experiences with others</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-bell"></i>
            </div>
            <h3>Notify</h3>
            <p>Get notified about new stories</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    await this._loadFeaturedStories();
  }

  async _loadFeaturedStories() {
    try {
      const token = AuthService.getToken();
      const isLoggedIn = AuthService.isLoggedIn();
      
      let response;
      
      if (isLoggedIn) {
        response = await ApiService.getAllStories({
          token,
          page: 1,
          size: 3,
          location: 1,
        });
      } else {
        // For demo purposes, we'll show some placeholder stories for non-logged in users
        // In a real app, you might have a public API endpoint or static content
        response = {
          error: false,
          listStory: [
            {
              id: 'story-sample-1',
              name: 'John Doe',
              description: 'Beautiful sunset at the beach',
              photoUrl: 'https://source.unsplash.com/random/800x600/?sunset',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'story-sample-2',
              name: 'Jane Smith',
              description: 'My coding journey at Dicoding',
              photoUrl: 'https://source.unsplash.com/random/800x600/?coding',
              createdAt: new Date().toISOString(),
            },
            {
              id: 'story-sample-3',
              name: 'Alex Johnson',
              description: 'Mountain hiking adventure',
              photoUrl: 'https://source.unsplash.com/random/800x600/?mountain',
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      const { listStory } = response;
      this._renderFeaturedStories(listStory);
    } catch (error) {
      console.error('Failed to load featured stories:', error);
      document.getElementById('featured-stories-list').innerHTML = `
        <div class="error-message">
          <p>Failed to load featured stories.</p>
        </div>
      `;
    }
  }

  _renderFeaturedStories(stories) {
    const featuredStoriesElement = document.getElementById('featured-stories-list');
    
    if (stories.length === 0) {
      featuredStoriesElement.innerHTML = `
        <div class="empty-state">
          <p>No stories found.</p>
          ${AuthService.isLoggedIn() 
            ? '<a href="#/stories/add" class="add-story-button">Add Your First Story</a>'
            : '<a href="#/register" class="add-story-button">Register to Add Stories</a>'}
        </div>
      `;
      return;
    }
    
    // Create HTML for stories
    const storiesHTML = stories.map((story) => `
      <article class="featured-story-item">
        <div class="featured-story-image-container">
          <img src="${story.photoUrl}" alt="${story.name}'s story" class="featured-story-image">
        </div>
        <div class="featured-story-content">
          <h3 class="featured-story-title">${story.name}'s Story</h3>
          <p class="featured-story-date">${showFormattedDate(story.createdAt)}</p>
          <p class="featured-story-description">${story.description}</p>
          <a href="${AuthService.isLoggedIn() ? `#/stories/${story.id}` : '#/login'}" class="featured-story-link">
            ${AuthService.isLoggedIn() ? 'View Details' : 'Login to View'}
          </a>
        </div>
      </article>
    `).join('');
    
    featuredStoriesElement.innerHTML = storiesHTML;
  }
}

export default HomePage;