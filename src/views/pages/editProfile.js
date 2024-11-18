import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'
import UserAPI from './../../UserAPI'
import Toast from '../../Toast'

let formData;

class EditProfileView {
  init() {
    console.log('EditProfileView.init', Auth.currentUser)
    document.title = 'Edit Profile'
    this.user = null;
    formData = {};
    this.render()
    Utils.pageIntroAnim()
    this.getUser()
  }

  async getUser() {
    try {
      this.user = await UserAPI.getUser(Auth.currentUser.id)

      this.render()
      this.setUserAccessLevel();
    } catch (err) {
      console.log(err);
      Toast.show('Error get user data', 'error')
    }
  }

  setUserAccessLevel() {
    document.querySelectorAll('input[name="access-level"]').forEach(input => {
      if (this.user.accessLevel === parseInt(input.value)) {
        input.setAttribute('checked', 'true');
      }
    });
  }

  // Clears and resets the form input elements
  resetForm() {
    const inputs = document.querySelectorAll(".form-register cal-input");
    if (inputs) {
      inputs.forEach(input => input.value = "");
    }

    this.setUserAccessLevel();
  }

  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }


  async updateProfileHandler() {
    const fields = ['firstName', 'lastName', 'email', 'password'];

    // Trims each field
    fields.forEach(field => {
      if (formData[field]) {
        formData[field] = formData[field].trim();
      }
    });

    // Validates email address
    if (formData['email'] && !Utils.validateEmail(formData['email'])) {
      document.querySelector(`cal-input[name="email"]`).setAttribute("hasError", "true");
      Toast.show(`Please enter a valid EMAIL address`, 'error');
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

    // Removes blank value entries
    Object.keys(formData).forEach(key => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        encodedFormData.append(key, formData[key]);
      }
    }

    const submitBtn = document.querySelector('cal-button');
    submitBtn.innerHTML = "<sl-spinner></sl-spinner>";

    try {
      const data = await UserAPI.updateUser(Auth.currentUser.id, encodedFormData, "Profile updated");
      delete data.user.password;
      this.user = data.user;
      Auth.currentUser = this.user;
      Auth.currentUser.id = this.user._id;
      this.render();
      this.resetForm();
    } catch (err) {
      console.log(err);
    }

    submitBtn.textContent = "Update";
  }

  render() {
    const template = html`
      <main-header></main-header>

      <div class="page-content page-centered">        
        ${(this.user == null) ? html`
          <main-spinner></main-spinner>
        `: html`
        <div class="register-wrapper">
          <h1>Edit your Profile</h1>

          <form class="form-register">
            <div class="input-wrapper">
              <cal-input label="First Name" name="firstName" type="text" placeholder="${Utils.titleCase(this.user.firstName)}"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <cal-input label="Last Name" name="lastName" type="text" placeholder="${Utils.titleCase(this.user.lastName)}"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <cal-input label="Email" name="email" type="email" placeholder="${this.user.email}"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <cal-input label="Password" name="password" type="text"
                @input-change=${this.handleInputChange}>
              </cal-input>
            </div>
            <div class="input-wrapper">
              <div class="input-label">User Type</div>
              <div class="radio-wrapper">
                <input type="radio" id="adult-access" name="access-level" value="2">
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
              .onClick=${() => this.updateProfileHandler()}
            >Update</cal-button>
          </form>
        `}
      </div>
    `
    render(template, App.rootEl)
  }
}

export default new EditProfileView()