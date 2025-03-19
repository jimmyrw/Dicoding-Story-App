const NetworkChecker = {
    isOnline() {
      return navigator.onLine;
    },
    
    initialize(callback) {
      window.addEventListener('online', () => {
        callback(true);
      });
      
      window.addEventListener('offline', () => {
        callback(false);
      });
    },
  };
  
  export default NetworkChecker;