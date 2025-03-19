class AuthService {
    static TOKEN_KEY = 'auth_token';
    static USER_KEY = 'auth_user';
  
    static saveToken(token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  
    static getToken() {
      return localStorage.getItem(this.TOKEN_KEY);
    }
  
    static removeToken() {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  
    static saveUser(user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  
    static getUser() {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (!userJson) return null;
      return JSON.parse(userJson);
    }
  
    static removeUser() {
      localStorage.removeItem(this.USER_KEY);
    }
  
    static isLoggedIn() {
      return !!this.getToken();
    }
  
    static login({ token, user }) {
      this.saveToken(token);
      this.saveUser(user);
    }
  
    static logout() {
      this.removeToken();
      this.removeUser();
      window.location.hash = '#/login';
    }
  }
  
  export default AuthService;