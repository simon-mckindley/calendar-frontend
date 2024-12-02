import App from '../../App'
import Auth from '../../Auth'
import { html, render } from 'lit'
import { anchorRoute, gotoRoute } from '../../Router'
import Utils from '../../Utils'
import Toast from '../../Toast'

let formData;

class RegisterView {
  init() {
    document.title = 'Register';
    formData = {};
    this.render();
    Utils.pageIntroAnim();
    this.checkbox = document.getElementById('show-checkbox');
    if (this.checkbox) {
      this.checkbox.addEventListener('input', () => this.showPassword());
    }
  }

  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }


  registerSubmitHandler() {
    // Checks if all data is present
    let error = "";
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirm'];

    fields.forEach(field => {
      if (formData[field]) {
        formData[field] = formData[field].trim();
      }

      if (!formData[field]) {
        document.querySelector(`cal-input[name="${field}"]`).setAttribute("hasError", "true");
        let fieldName = field.includes('confirm') ? "PASSWORD CONFIRMATION" : field;
        fieldName = field.includes('Name') ? field.slice(0, -4).concat(" ", "name") : fieldName;
        error += error ? `, ${fieldName.toUpperCase()}` : fieldName.toUpperCase();
      }
    });

    if (error) {
      Toast.show(`Please enter your ${error}`, 'error');
      return;
    }

    // Validates email address
    if (!Utils.validateEmail(formData['email'])) {
      document.querySelector('cal-input[name="email"]').setAttribute("hasError", "true");
      Toast.show('Please enter a valid EMAIL address', 'error');
      return;
    }

    // Validate password
    const minPasswordLength = 6;
    if (formData['password'].length < minPasswordLength) {
      document.querySelector('cal-input[name="password"]').setAttribute("hasError", "true");
      Toast.show(`PASSWORD must be a least ${minPasswordLength} characters`, 'error');
      return;
    }

    if (formData['password'] !== formData['confirm']) {
      document.querySelector('cal-input[name="confirm"]').setAttribute("hasError", "true");
      Toast.show('PASSWORD CONFIRMATION mismatch', 'error');
      return;
    }

    // Gets user access level
    document.querySelectorAll('input[name="access-level"]').forEach(input => {
      if (input.checked) {
        formData['accessLevel'] = parseInt(input.value);
      }
    });

    if (!formData['accessLevel'] || typeof (formData['accessLevel']) !== "number") {
      Toast.show(`Invalid user type`, 'error');
      return;
    }

    delete formData.confirm;

    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        encodedFormData.append(key, formData[key]);
      }
    }
    const submitBtn = document.querySelector('cal-button');
    submitBtn.innerHTML = "<sl-spinner></sl-spinner>";

    // sign up using Auth
    Auth.signUp(encodedFormData, () => {
      submitBtn.textContent = "Register";
    });
  }

  // Shows or hides the password input data
  showPassword() {
    const input = document.querySelector('cal-input[name="password"]');
    input.type = this.checkbox.checked ? 'text' : 'password';

    // Hides automatically after a set time
    if (this.checkbox.checked) {
      setTimeout(() => {
        this.checkbox.checked = false;
        input.type = 'password';
      }, 8000);
    }
  }


  render() {
    const template = html`   
      <main-header></main-header>

      <div class="page-content page-centered">      
        <div class="register-wrapper">
          <form class="form-register">

            <div class="input-wrapper">
              <cal-input label="First Name" name="firstName" type="text"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <cal-input label="Last Name" name="lastName" type="text"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <cal-input label="Email" name="email" type="email"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper password-wrapper">
              <div class="password-inner">
                <cal-input label="Password" name="password" type="password"
                  @input-change=${this.handleInputChange}>
                </cal-input>
                <sl-checkbox id="show-checkbox" size="small" tabindex="-1">Show</sl-checkbox>
              </div>
              <cal-input label="Confirm Password" name="confirm" type="password"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <div class="input-label">User Type</div>
              <div class="radio-wrapper">
                <input type="radio" id="adult-access" name="access-level" value="2" checked>
                <label for="adult-access">Adult</label>
                <input type="radio" id="child-access" name="access-level" value="3">
                <label for="child-access">Child</label>
                <input type="radio" id="admin-access" name="access-level" value="1">
                <label for="admin-access">Admin</label>
              </div>
            </div>

            <cal-button
              buttonType="primary"
              addStyle="width: 100%; margin-block-start: 2em;" 
              .onClick=${() => this.registerSubmitHandler()}
            >Register</cal-button>
          </form>

          <p class="acc-link">Already registered? 
            <a href="/login" @click=${anchorRoute}>Login</a>
          </p>
        </div>
      </div>
    `
    render(template, App.rootEl)
  }
}


export default new RegisterView()