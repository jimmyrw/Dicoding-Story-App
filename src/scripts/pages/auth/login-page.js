import ApiService from '../../data/api-service';
import AuthService from '../../data/auth-service';

class LoginPage {
  async render() {
    return `
      <section class="auth-container container">
        <h1>Login</h1>
        
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Your email" aria-required="true">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="Your password" aria-required="true" minlength="8">
          </div>
          
          <button type="submit" class="submit-button">Login</button>
          
          <p class="auth-redirect">
            Don't have an account? <a href="#/register">Register here</a>
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        // Show loading indicator
        document.querySelector('.submit-button').innerHTML = 'Logging in...';
        document.querySelector('.submit-button').disabled = true;
        
        const response = await ApiService.login({ email, password });
        
        if (response.error) {
          alert(response.message);
          return;
        }
        
        const { token, userId, name } = response.loginResult;
        
        // Save auth data
        AuthService.login({
          token,
          user: {
            id: userId,
            name,
            email,
          },
        });
        
        // Redirect to stories page
        window.location.hash = '#/stories';
      } catch (error) {
        console.error('Login error:', error);
        alert('Failed to login. Please try again.');
      } finally {
        // Reset button state
        document.querySelector('.submit-button').innerHTML = 'Login';
        document.querySelector('.submit-button').disabled = false;
      }
    });
  }
}

export default LoginPage;