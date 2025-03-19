class ViewTransitionUtils {
    static async transitionPage(callback) {
      if (!document.startViewTransition) {
        return callback();
      }
  
      return document.startViewTransition(callback).ready;
    }
  
    static setupPageTransition() {
      // Add CSS for view transitions
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @keyframes slide-from-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
  
        @keyframes slide-to-left {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
  
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
  
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
  
        ::view-transition-old(root) {
          animation: 300ms ease-out both slide-to-left, 150ms ease-out both fade-out;
        }
  
        ::view-transition-new(root) {
          animation: 300ms ease-out both slide-from-right, 150ms ease-in 150ms both fade-in;
        }
      `;
      document.head.appendChild(styleElement);
    }
  
    // Setup custom animation for specific elements
    static setupCustomTransition(elementSelector, customName) {
      const elements = document.querySelectorAll(elementSelector);
      
      elements.forEach(element => {
        element.style.viewTransitionName = customName;
      });
    }
  }
  
  export default ViewTransitionUtils;