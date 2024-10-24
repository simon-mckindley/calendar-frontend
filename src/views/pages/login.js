import App from '../../App'
import { html, render } from 'lit'
import { anchorRoute, gotoRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import Toast from '../../Toast'

let formData;

class LoginView {
  init() {
    document.title = 'Login'
    formData = {};
    this.render()
    Utils.pageIntroAnim()
  }

  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }

  // Handle form submission
  signInSubmitHandler() {
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
            <cal-input label="Email" name="email" type="email"
              @input-change=${this.handleInputChange}>
            </cal-input>
            <cal-input label="Password" name="password" type="password"
              @input-change=${this.handleInputChange}
              style="margin-block-start: 0.5em">
            </cal-input>

            <cal-button
              buttonType="primary"
              style="width: 100%; margin-block-start: 1em" 
              .onClick=${() => this.signInSubmitHandler()}
            >Login</cal-button>

            <cal-button 
              buttonType="secondary" 
              style="width: 100%; margin-block-start: 0.5em" 
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