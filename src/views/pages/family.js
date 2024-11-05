import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'
import Toast from '../../Toast'
import DataAPI from '../../DataAPI'

let formData;

class FamilyView {
  init() {
    console.log('FamilyView.init');
    document.title = 'Family';
    formData = {};
    this.familyData = null;
    this.editFamilyDialog = null;
    this.adult = Auth.currentUser.accessLevel === 2;
    this.render();
    Utils.pageIntroAnim();
    this.getFamily();
  }

  async getFamily() {
    try {
      if (Auth.currentUser.family) {
        this.familyData = await DataAPI.getFamily(Auth.currentUser.family);
      } else {
        this.familyData = {};
      }
      this.render();
      this.editFamilyDialog = document.querySelector('.dialog-edit-family');
    } catch (err) {
      Toast.show(err, 'error');
    }
  }

  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }

  // Handle update submission
  async updateFamilyHandler() {
    // Checks if data is present
    const field = 'name';
    const input = document.querySelector(`cal-input[name="${field}"]`);

    if (!formData[field]) {
      input.setAttribute("hasError", "true");
      Toast.show(`Please enter the ${field.toUpperCase()}`, 'error');
      return;
    }

    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        encodedFormData.append(key, formData[key]);
      }
    }

    // call api    
    await DataAPI.updateFamily(this.familyData._id, encodedFormData);

    this.editFamilyDialog.hide();
    this.getFamily();
    input.value = '';
    formData = {};
  }


  render() {
    const template = html`
    <main-header></main-header>

    <div class="page-content page-centered">
      ${this.familyData == null
        ? html`<sl-spinner></sl-spinner>`
        : html`
          <div class="family-wrapper">
            <div>
              <div class="user-header">
                <div class="avatar-row">
                  <sl-avatar
                    style="--size: 5rem;"
                    image="${(Auth.currentUser && Auth.currentUser.avatar)
            ? `${App.apiBase}/images/${Auth.currentUser.avatar}`
            : ''}">
                  </sl-avatar>
                  <div class="name">
                    ${Auth.currentUser.firstName} ${Auth.currentUser.lastName}
                  </div>
                </div>
                <div class="email">${Auth.currentUser.email}</div>
                <div class="date">Joined <span>${Utils.formatDateAU(Auth.currentUser.createdAt)}</span></div>
              </div>

              <div class="family-title">
                <span>Family</span>
                ${this.familyData.name
            ? html`
                    <div class="family-name-row">
                      <div class="family-name">${Utils.titleCase(this.familyData.name)}</div>
                      
                      ${this.adult
                ? html`
                          <sl-tooltip content="Edit family name">
                            <cal-button
                              .onClick="${() => this.editFamilyDialog.show()}" 
                              buttonType="secondary"
                              addStyle="padding-inline: 0.6em;">
                              <i class="fa-solid fa-pen"></i>
                            </cal-button>
                          </sl-tooltip>

                          <sl-tooltip content="Leave family">
                            <cal-button
                              .onClick="${() => alert('Button Clicked')}" 
                              buttonType="primary"
                              addStyle="padding-inline: 0.7em;">
                              <i class="fa-solid fa-xmark"></i>
                            </cal-button>
                          </sl-tooltip>`
                : html``}
                    </div>`
            : html`
                    <div class="family-name no-family">No associated family</div>
                    <cal-button 
                      .onClick="${() => alert('Button Clicked')}" 
                      buttonType="primary">
                      Create Family
                    </cal-button>`
          }
              </div>
            </div>

            <div class="family-members">
              ${this.familyData.name
            ? html`
                  <div class="members-title">
                    <h2 class="scroll-box-title">Family Members</h2>
                    ${this.adult
                ? html`
                        <sl-tooltip content="Invite family member">
                          <cal-button 
                            .onClick="${() => alert('Button Clicked')}" 
                            buttonType="secondary"
                            addStyle="padding-inline: 0.7em;">
                            <i class="fa-solid fa-plus"></i>
                          </cal-button>
                        </sl-tooltip>`
                : html``}
                  </div>

                  <div class="members-wrapper data-scroll-box">
                    ${this.familyData.users && this.familyData.users.length > 0
                ? html`
                        ${this.familyData.users
                    .filter(item => item.email !== Auth.currentUser.email) // Exclude current user
                    .sort((a, b) => a.accessLevel - b.accessLevel) // Sort by accessLevel ascending
                    .map(member => html`<user-tile .user="${member}"></user-tile>`)}`
                : html`<div>No other family members</div>`}
                  </div>`
            : html``}
            </div>
          </div>
          
          <sl-dialog label="Edit Family Name" class="dialog-edit-family">
            <cal-input 
              placeholder=${Utils.titleCase(this.familyData.name)} 
              name="name" type="text"
              addStyle="margin-block-end: 1rem;"
              @input-change=${this.handleInputChange}>
            </cal-input>

            <cal-button
              id="update-submit"
              slot="footer"
              .onClick="${() => this.updateFamilyHandler()}" 
              buttonType="secondary">
              Save
            </cal-button>

            <cal-button
              slot="footer"
              .onClick="${() => this.editFamilyDialog.hide()}" 
              buttonType="primary">
              Cancel
            </cal-button>
          </sl-dialog>`
      }
    </div>`;

    render(template, App.rootEl);
  }
}

export default new FamilyView()