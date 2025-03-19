import ApiService from '../../data/api-service';

class RegisterPage {
  async render() {
    return `
      <section class="auth-container container">
        <h1>Register</h1>
        
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required placeholder="Your name" aria-required="true">
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Your email" aria-required="true">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="Your password" aria-required="true" minlength="8">
            <small>Password must be at least 8 characters</small>
          </div>
          
          <div class="form-group">
            <label for="password-confirm">Confirm Password</label>
            <input type="password" id="password-confirm" name="password-confirm" required placeholder="Confirm your password" aria-required="true" minlength="8">
          </div>
          
          <button type="submit" class="submit-button">Register</button>
          
          <p class="auth-redirect">
            Already have an account? <a href="#/login">Login here</a>
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      
      // Validate form
      if (password !== passwordConfirm) {
        alert('Passwords do not match!');
        return;
      }
      
      try {
        // Show loading indicator
        document.querySelector('.submit-button').innerHTML = 'Registering...';
        document.querySelector('.submit-button').disabled = true;
        
        const response = await ApiService.register({ name, email, password });
        
        if (response.error) {
          alert(response.message);
          return;
        }
        
        alert('Registration successful! Please login.');
        window.location.hash = '#/login';
      } catch (error) {
        console.error('Register error:', error);
        alert('Failed to register. Please try again.');
      } finally {
        // Reset button state
        document.querySelector('.submit-button').innerHTML = 'Register';
        document.querySelector('.submit-button').disabled = false;
      }
    });
  }
}

export default RegisterPage;