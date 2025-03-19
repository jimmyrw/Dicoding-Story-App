import ApiService from '../../data/api-service';
import AuthService from '../../data/auth-service';
import mapUtils from '../../utils/map-utils';
import CameraUtils from '../../utils/camera-utils';

class AddStoryPage {
  #map = null;
  #cameraUtils = null;

  async render() {
    return `
      <section class="add-story-page container">
        <h1>Add New Story</h1>
        
        <form id="add-story-form" class="add-story-form">
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" required placeholder="What's your story about?" rows="4" aria-required="true"></textarea>
          </div>
          
          <div class="form-group">
            <label for="photo">Photo</label>
            
            <div class="camera-container">
              <button type="button" id="start-camera-button" class="camera-button">
                <i class="fas fa-camera"></i> Take Photo with Camera
              </button>
              
              <div id="camera-preview-container" class="camera-preview-container" style="display: none;">
                <video id="camera-preview" class="camera-preview" autoplay></video>
                <button type="button" id="capture-button" class="capture-button" disabled>
                  <i class="fas fa-camera"></i> Capture
                </button>
                <button type="button" id="stop-camera-button" class="stop-camera-button">
                  <i class="fas fa-times"></i> Cancel
                </button>
              </div>
              
              <div class="file-upload-container">
                <p>Or upload a photo:</p>
                <input type="file" id="photo" name="photo" accept="image/*" required aria-required="true">
              </div>
              
              <div id="image-preview-container" class="image-preview-container" style="display: none;">
                <img id="image-preview" class="image-preview" alt="Preview of selected or captured image">
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Location</label>
            <p class="location-help">Click on the map to set your story's location (optional)</p>
            
            <div id="location-map" class="location-map"></div>
            
            <div class="location-inputs">
              <div class="form-group">
                <label for="latitude">Latitude</label>
                <input type="number" id="latitude" name="latitude" step="any" placeholder="Latitude">
              </div>
              
              <div class="form-group">
                <label for="longitude">Longitude</label>
                <input type="number" id="longitude" name="longitude" step="any" placeholder="Longitude">
              </div>

              <button type="button" id="get-current-location" class="location-button">
                <i class="fas fa-map-marker-alt"></i> Use My Location
              </button>
            </div>
          </div>
          
          <button type="submit" class="submit-button">Post Story</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    // Setup map for location selection
    this.#map = mapUtils.setupLocationSelector(
      'location-map',
      document.getElementById('latitude'),
      document.getElementById('longitude')
    );
    
    // Setup camera
    this._setupCamera();
    
    // Setup other event listeners
    this._setupEventListeners();
  }

  _setupCamera() {
    const startCameraButton = document.getElementById('start-camera-button');
    const stopCameraButton = document.getElementById('stop-camera-button');
    const cameraPreviewContainer = document.getElementById('camera-preview-container');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    
    startCameraButton.addEventListener('click', () => {
      cameraPreviewContainer.style.display = 'block';
      startCameraButton.style.display = 'none';
      
      // Initialize camera
      this.#cameraUtils = new CameraUtils({
        video: document.getElementById('camera-preview'),
        canvas: document.createElement('canvas'), // Hidden canvas for capturing
        captureButton: document.getElementById('capture-button'),
        imagePreview: document.getElementById('image-preview'),
        fileInput: document.getElementById('photo'),
      });
      
      this.#cameraUtils.start();
    });
    
    stopCameraButton.addEventListener('click', () => {
      if (this.#cameraUtils) {
        this.#cameraUtils.stop();
      }
      
      cameraPreviewContainer.style.display = 'none';
      startCameraButton.style.display = 'block';
    });
    
    // Preview uploaded image
    document.getElementById('photo').addEventListener('change', (event) => {
      const file = event.target.files[0];
      
      if (file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          document.getElementById('image-preview').src = e.target.result;
          imagePreviewContainer.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
      } else {
        imagePreviewContainer.style.display = 'none';
      }
    });
  }

  _setupEventListeners() {
    // Get current location
    document.getElementById('get-current-location').addEventListener('click', async () => {
      try {
        const { lat, lon } = await mapUtils.getCurrentLocation();
        
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lon;
        
        // Update map
        this.#map.setView([lat, lon], 15);
        
        // Add or update marker
        const layers = this.#map.getLayers();
        const hasMarker = layers.some(layer => layer instanceof L.Marker);
        
        if (hasMarker) {
          // Update existing marker
          layers.forEach(layer => {
            if (layer instanceof L.Marker) {
              layer.setLatLng([lat, lon]);
            }
          });
        } else {
          // Add new marker
          mapUtils.addMarker(this.#map, lat, lon);
        }
      } catch (error) {
        console.error('Failed to get current location:', error);
        alert('Failed to get your current location. Please try setting it manually on the map.');
      }
    });
    
    // Form submission
    document.getElementById('add-story-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const description = document.getElementById('description').value;
      const photoInput = document.getElementById('photo');
      const latitude = document.getElementById('latitude').value || null;
      const longitude = document.getElementById('longitude').value || null;
      
      // Validate form
      if (!photoInput.files || photoInput.files.length === 0) {
        alert('Please select or capture a photo');
        return;
      }
      
      try {
        // Show loading indicator
        document.querySelector('.submit-button').innerHTML = 'Posting...';
        document.querySelector('.submit-button').disabled = true;
        
        const token = AuthService.getToken();
        const response = await ApiService.addNewStory({
          token,
          description,
          photo: photoInput.files[0],
          lat: latitude,
          lon: longitude,
        });
        
        if (response.error) {
          throw new Error(response.message);
        }
        
        alert('Story posted successfully!');
        window.location.hash = '#/stories';
      } catch (error) {
        console.error('Failed to post story:', error);
        alert('Failed to post story. Please try again.');
      } finally {
        // Reset button state
        document.querySelector('.submit-button').innerHTML = 'Post Story';
        document.querySelector('.submit-button').disabled = false;
      }
    });
  }
}

export default AddStoryPage;