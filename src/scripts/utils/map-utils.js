import L from 'leaflet';
import CONFIG from '../config';

const mapUtils = {
  initMap(elementId, options = {}) {
    const defaultOptions = {
      center: [-6.2088, 106.8456], // Jakarta center
      zoom: 13,
    };
    
    const map = L.map(elementId, { ...defaultOptions, ...options });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add additional base layers
    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    });

    const baseMaps = {
      "Street": streets,
      "Satellite": satellite
    };

    L.control.layers(baseMaps).addTo(map);
    
    return map;
  },

  addMarker(map, lat, lon, options = {}) {
    const marker = L.marker([lat, lon], options);
    marker.addTo(map);
    return marker;
  },

  addMarkerWithPopup(map, lat, lon, popupContent, options = {}) {
    const marker = this.addMarker(map, lat, lon, options);
    marker.bindPopup(popupContent);
    return marker;
  },

  addMarkersFromStories(map, stories) {
    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const popupContent = `
          <div class="map-popup">
            <h3>${story.name}</h3>
            <img src="${story.photoUrl}" alt="${story.name}'s story" width="150">
            <p>${story.description}</p>
            <a href="#/story/${story.id}" aria-label="View detail story by ${story.name}">View Detail</a>
          </div>
        `;
        
        this.addMarkerWithPopup(map, story.lat, story.lon, popupContent);
      }
    });
  },

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            });
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  },

  setupLocationSelector(mapId, latInput, lonInput) {
    const map = this.initMap(mapId);
    let marker = null;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = this.addMarker(map, lat, lng);
      }
      
      // Update form inputs
      latInput.value = lat;
      lonInput.value = lng;
    });

    return map;
  }
};

export default mapUtils;