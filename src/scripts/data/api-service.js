import CONFIG from '../config';

const API_ENDPOINT = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  GET_DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  CREATE_STORY: `${CONFIG.BASE_URL}/stories`,
  CREATE_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

class ApiService {
  static async register({ name, email, password }) {
    const response = await fetch(API_ENDPOINT.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
    
    const responseJson = await response.json();
    return responseJson;
  }

  static async login({ email, password }) {
    const response = await fetch(API_ENDPOINT.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    const responseJson = await response.json();
    return responseJson;
  }

  static async getAllStories({ token, page = 1, size = 10, location = 0 }) {
    const response = await fetch(`${API_ENDPOINT.GET_ALL_STORIES}?page=${page}&size=${size}&location=${location}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const responseJson = await response.json();
    return responseJson;
  }

  static async getDetailStory({ token, id }) {
    const response = await fetch(API_ENDPOINT.GET_DETAIL_STORY(id), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const responseJson = await response.json();
    return responseJson;
  }

  static async addNewStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(API_ENDPOINT.CREATE_STORY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    
    const responseJson = await response.json();
    return responseJson;
  }

  static async addNewStoryAsGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(API_ENDPOINT.CREATE_STORY_GUEST, {
      method: 'POST',
      body: formData,
    });
    
    const responseJson = await response.json();
    return responseJson;
  }

  static async subscribeNotification({ token, subscription }) {
    const response = await fetch(API_ENDPOINT.SUBSCRIBE_NOTIFICATION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
    
    const responseJson = await response.json();
    return responseJson;
  }

  static async unsubscribeNotification({ token, endpoint }) {
    const response = await fetch(API_ENDPOINT.UNSUBSCRIBE_NOTIFICATION, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    
    const responseJson = await response.json();
    return responseJson;
  }
}

export default ApiService;