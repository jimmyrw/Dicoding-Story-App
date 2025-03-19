class AppShell {
    constructor({content, drawerButton, navigationDrawer, skipLink}) {
      this.content = content;
      this.drawerButton = drawerButton;
      this.navigationDrawer = navigationDrawer;
      this.skipLink = skipLink;
      
      this._initialAppShell();
    }
    
    _initialAppShell() {
      this._setupDrawer();
      this._setupSkipLink();
    }
    
    _setupDrawer() {
      this.drawerButton.addEventListener('click', () => {
        this.navigationDrawer.classList.toggle('open');
      });
  
      document.body.addEventListener('click', (event) => {
        if (!this.navigationDrawer.contains(event.target) && !this.drawerButton.contains(event.target)) {
          this.navigationDrawer.classList.remove('open');
        }
      });
    }
    
    _setupSkipLink() {
      this.skipLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.content.setAttribute('tabindex', '-1');
        this.content.focus();
      });
  
      this.content.addEventListener('blur', () => {
        this.content.removeAttribute('tabindex');
      });
    }
  }
  
  export default AppShell;