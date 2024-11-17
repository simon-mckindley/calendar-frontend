import App from '../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import Toast from '../../Toast'
import UserAPI from '../../UserAPI'
import FamilyAPI from '../../FamilyAPI'

const userType = { 1: "Admin", 2: "Adult", 3: "Child" };

class AccountView {
  init() {
    document.title = 'Account'
    this.user = null;
    this.familyData = null;
    this.render();
    Utils.pageIntroAnim();
    this.getUser();
  }


  async getUser() {
    try {
      this.user = await UserAPI.getUser(Auth.currentUser.id);
      console.log(this.user);

      await this.getFamily();
      this.render();
      return this.user;
    } catch (err) {
      console.log(err);
      Toast.show('Error getting user data', 'error');
    }
  }

  async getFamily() {
    try {
      if (this.user.family) {
        this.familyData = await FamilyAPI.getFamily(this.user.family);
      }
      console.log(this.familyData)
    } catch (err) {
      console.log(err)
      Toast.show('Error getting family data', 'error');
    }
  }

  render() {
    const template = html`
      <main-header></main-header>

      <div class="page-content page-centered">
        ${!this.user
        ? html`<main-spinner></main-spinner>`
        : html`
        <div class="user-wrapper">
          <div class="avatar-row">
            <sl-avatar
              style="--size: 10rem;"
              image="${this.user.avatar
            ? `${App.apiBase}/images/${this.getUser.avatar}`
            : ''}">
            </sl-avatar>
            <div class="name">
              ${Utils.titleCase(this.user.firstName)} ${Utils.titleCase(this.user.lastName)}
            </div>
          </div>

          <div class="email">${this.user.email}</div>

          <div class="date">Joined <span>${Utils.formatDateAU(this.user.createdAt)}</span></div>
          
          <div class="access">Access <span>${userType[this.user.accessLevel]}</span></div>
          
          <div class="events">Current Events <span>${this.user.events.length}</span></div>
          
          <div class="family">Family 
          ${this.familyData
            ? html`
            <div class="family-name">${Utils.titleCase(this.familyData.name)}</div>
            <div class="family-number">Members <span>${this.familyData.users.length}</span></div>
            `
            : html`<span>No associated family</span>`
          } 
          </div>
          
        </div>

        <sl-button @click=${() => gotoRoute('/editProfile')}>Edit Profile</sl-button>
      </div>
        `}    
    `
    render(template, App.rootEl)
  }
}


export default new AccountView()