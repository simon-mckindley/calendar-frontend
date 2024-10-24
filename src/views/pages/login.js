import App from '../../App'
import { html, render } from 'lit'
import { anchorRoute, gotoRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import Toast from '../../Toast'

let formData;

class LoginView {
  init() {
    document.title = 'Login';
    formData = {};
    this.render();
    Utils.pageIntroAnim();
  }

  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }

  // Handle form submission
  loginSubmitHandler() {
    // Checks if all data is present
    let error = "";
    const fields = ['email', 'password'];

    fields.forEach(field => {
      if (!formData[field]) {
        document.querySelector(`cal-input[name="${field}"]`).setAttribute("hasError", "true");
        error += error ? ` and ${field.toUpperCase()}` : field.toUpperCase();
      }
    });

    if (error) {
      Toast.show(`Please enter your ${error}`, 'error');
      return;
    }

    // Validates email address
    if (!Utils.validateEmail(formData['email'])) {
      document.querySelector(`cal-input[name="email"]`).setAttribute("hasError", "true");
      Toast.show(`Please enter a valid EMAIL address`, 'error');
      return;
    }

    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        encodedFormData.append(key, formData[key]);
      }
    }
    const submitBtn = document.querySelector('cal-button');
    submitBtn.textContent = "Loading...";
    //submitBtn.setAttribute('loading', '');

    // sign in using Auth    
    Auth.signIn(encodedFormData, () => {
      submitBtn.textContent = "Login";
    })
  }

  render() {
    const template = html`  
      <main-header></main-header>

      <div class="page-content page-centered" style="overflow: hidden;">
        <div class="login-wrapper">
          <div>
            <img class="login-logo" src="/images/calendar_image.png">      
          </div>
 
          <form class="form-login">
            <div class="input-wrapper">
              <cal-input label="Email" name="email" type="email"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <cal-input label="Password" name="password" type="password"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>

            <cal-button
              buttonType="primary"
              addStyle="width: 100%; margin-block-start: 2em;" 
              .onClick=${() => this.loginSubmitHandler()}
            >Login</cal-button>

            <cal-button 
              buttonType="secondary" 
              addStyle="width: 100%; margin-block-start: 1em;" 
              .onClick=${() => gotoRoute('/register')}
            >Register</cal-button>
          </form>
        </div>
      </div>
    `
    render(template, App.rootEl)
  }
}

export default new LoginView()