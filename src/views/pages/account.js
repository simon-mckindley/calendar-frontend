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

  // Gets current user data
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

  // Gets user family data
  async getFamily() {
    try {
      if (this.user.family) {
        this.familyData = await FamilyAPI.getFamily(this.user.family);
      }
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
          <sl-avatar
            image="${this.user.avatar
            ? `${App.apiBase}/images/${this.getUser.avatar}`
            : ''}">
          </sl-avatar>

          <div class="name user-data">
            ${Utils.titleCase(this.user.firstName)} ${Utils.titleCase(this.user.lastName)}
          </div>

          <div class="email user-data">${this.user.email}</div>

          <div class="date user-label">Joined <span class="user-data">${Utils.formatDateAU(this.user.createdAt)}</span></div>
          
          <div class="access user-label">Access <span class="user-data">${userType[this.user.accessLevel]}</span></div>
          
          <div class="events user-label">Current Events 
            <a class="user-link" href="/calendar"  @click=${anchorRoute}>
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          ${(this.user.events || this.user.events.length === 0)
            ? html`<span class="user-data">${this.user.events.length}</span>`
            : html`<span class="user-data">No associated events</span>`
          }
          </div>
          
          <div class="family">Family
            <a class="user-link" href="/family"  @click=${anchorRoute}>
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          ${this.familyData
            ? html`
            <div class="family-name user-data">${Utils.titleCase(this.familyData.name)}</div>
            <div class="family-number user-label">Members <span class="user-data">${this.familyData.users.length}</span></div>
            `
            : html`<span class="user-data">No associated family</span>`
          } 
          </div>
          
        </div>

        <cal-button
          buttonType="primary"
          addStyle="width: 100%;"
          .onClick=${() => gotoRoute('/editProfile')}
        >Edit account</cal-button>

      </div>
        `}    
    `
    render(template, App.rootEl)
  }
}


export default new AccountView()