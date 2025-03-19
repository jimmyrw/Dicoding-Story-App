class NotFoundPage {
    async render() {
      return `
        <section class="not-found-page container">
          <div class="not-found-content">
            <h1 class="not-found-title">404</h1>
            <h2 class="not-found-subtitle">Page Not Found</h2>
            <p class="not-found-description">The page you are looking for doesn't exist or has been moved.</p>
            <div class="not-found-actions">
              <a href="#/" class="primary-button">Go to Home</a>
              <a href="#/stories" class="secondary-button">View Stories</a>
            </div>
          </div>
        </section>
      `;
    }
  
    async afterRender() {
      document.title = 'Page Not Found - StoryApp';
    }
  }
  
  export default NotFoundPage;