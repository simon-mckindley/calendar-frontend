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
    console.log('EditProfileView.init');
    document.title = 'Edit Profile';
    this.user = null;
    formData = {}; // Reset formData
    this.render();
    Utils.pageIntroAnim();
    this.getUser();
  }

  async getUser() {
    try {
      this.user = await UserAPI.getUser(Auth.currentUser.id);
      this.render();
      this.setUserAccessLevel();
    } catch (err) {
      console.log(err);
      Toast.show('Error fetching user data', 'error');
    }
  }

  setUserAccessLevel() {
    document.querySelectorAll('input[name="access-level"]').forEach((input) => {
      if (this.user.accessLevel === parseInt(input.value)) {
        input.setAttribute('checked', 'true');
      }
    });
  }

  resetForm() {
    const inputs = document.querySelectorAll(".form-register cal-input");
    if (inputs) {
      inputs.forEach((input) => (input.value = ""));
    }
    this.setUserAccessLevel();
  }

  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value, files } = event.detail;

    if (files && files.length > 0) {
      // Handle file input
      formData[name] = files[0];
    } else {
      // Handle text input
      formData[name] = value;
    }
  }


  async updateProfileHandler() {
    const fields = ["firstName", "lastName", "email", "password"];

    fields.forEach((field) => {
      if (formData[field]) {
        formData[field] = formData[field].trim();
      }
    });

    if (formData["email"] && !Utils.validateEmail(formData["email"])) {
      document.querySelector(`cal-input[name="email"]`).setAttribute("hasError", "true");
      Toast.show("Please enter a valid EMAIL address", "error");
      return;
    }

    document.querySelectorAll('input[name="access-level"]').forEach((input) => {
      if (input.checked) {
        formData["accessLevel"] = parseInt(input.value);
      }
    });

    if (!formData["accessLevel"] || typeof formData["accessLevel"] !== "number") {
      Toast.show("Invalid user type", "error");
      return;
    }

    Object.keys(formData).forEach((key) => {
      if (formData[key] === "" || formData[key] === null) {
        delete formData[key];
      }
    });

    const encodedFormData = new FormData();

    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        // Handle file input
        if (key === 'avatar' && formData[key] instanceof FileList) {
          if (formData[key].length > 0) {
            encodedFormData.append(key, formData[key][0]); // Append the first file
          }
        } else {
          encodedFormData.append(key, formData[key]);
        }
      }
    }

    const submitBtn = document.querySelector("cal-button");
    submitBtn.innerHTML = "<sl-spinner></sl-spinner>";

    try {
      const data = await UserAPI.updateUser(Auth.currentUser.id, encodedFormData, "Account updated");
      delete data.user.password;
      this.user = data.user;
      Auth.currentUser = this.user;
      Auth.currentUser.id = this.user._id;
      this.render();
      this.resetForm();
      formData = {};

    } catch (err) {
      console.log(err);
    }

    submitBtn.textContent = "Update";
  }


  render() {
    const template = html`
      <main-header></main-header>

      <div class="page-content page-centered">
        ${this.user == null
        ? html`<main-spinner style="align-content: center;"></main-spinner>`
        : html`
              <div class="register-wrapper">
                <h1>Edit your Account</h1>

                <form class="form-register">
                  <div class="input-wrapper avatar-wrapper">
                    <sl-avatar
                      style="--size: 4rem;"
                      image=${this.user.avatar ? `${App.apiBase}/images/${Auth.currentUser.avatar}` : ""}
                    ></sl-avatar>
                    <div>
                      <cal-input
                        label="Avatar Icon"
                        name="avatar"
                        type="file"
                        placeholder="${this.user.avatar}"
                        @input-change=${this.handleInputChange}
                      >
                      </cal-input>
                    </div>
                  </div>
                  <div class="input-wrapper">
                    <cal-input
                      label="First Name"
                      name="firstName"
                      type="text"
                      placeholder="${Utils.titleCase(this.user.firstName)}"
                      @input-change=${this.handleInputChange}
                    >
                    </cal-input>
                  </div>
                  <div class="input-wrapper">
                    <cal-input
                      label="Last Name"
                      name="lastName"
                      type="text"
                      placeholder="${Utils.titleCase(this.user.lastName)}"
                      @input-change=${this.handleInputChange}
                    >
                    </cal-input>
                  </div>
                  <div class="input-wrapper">
                    <cal-input
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="${this.user.email}"
                      @input-change=${this.handleInputChange}
                    >
                    </cal-input>
                  </div>
                  <div class="input-wrapper">
                    <cal-input label="Password" name="password" type="text" @input-change=${this.handleInputChange}>
                    </cal-input>
                  </div>
                  <div class="input-wrapper">
                    <div class="input-label">User Type</div>
                    <div class="radio-wrapper">
                      <input type="radio" id="adult-access" name="access-level" value="2" />
                      <label for="adult-access">Adult</label>
                      <input type="radio" id="child-access" name="access-level" value="3" />
                      <label for="child-access">Child</label>
                      <input type="radio" id="admin-access" name="access-level" value="1" />
                      <label for="admin-access">Admin</label>
                    </div>
                  </div>

                  <cal-button
                    buttonType="primary"
                    addStyle="width: 100%; margin-block-start: 2em;"
                    .onClick=${() => this.updateProfileHandler()}
                    >Update</cal-button
                  >
                </form>
              </div>
            `}
      </div>
    `;
    render(template, App.rootEl);
  }
}

export default new EditProfileView();