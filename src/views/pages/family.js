import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'
import Toast from '../../Toast'
import DataAPI from '../../DataAPI'

let userTypes = { 2: "Adult", 3: "Child" };

class FamilyView {
    init() {
        console.log('FamilyView.init');
        document.title = 'Family';
        this.familyData = null;
        this.adult = Auth.currentUser.accessLevel === 2;
        console.log("IS ADULT: " + this.adult);
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
        } catch (err) {
            Toast.show(err, 'error');
        }
    }

    render() {
        const template = html`
      <main-header></main-header>

      <div class="page-content page-centered">
        ${this.familyData == null ?
            html`
          <sl-spinner></sl-spinner>` :
            html`
          <div class="family-wrapper">
            <div>
              <div class="user-header">
                <div class="avatar-row">
                  <sl-avatar style="--size: 5rem;" image=${(Auth.currentUser && Auth.currentUser.avatar) ?
                      `${App.apiBase}/images/${Auth.currentUser.avatar}` : ''}></sl-avatar>
                  <div class="name">${Auth.currentUser.firstName} ${Auth.currentUser.lastName}</div>
                </div>
                <div class="email">${Auth.currentUser.email}</div>
                <div class="date">Joined <span>${Utils.formatDateAU(Auth.currentUser.createdAt)}</span></div>
              </div>

              <div class="family-title">
                <span>Family</span>
                ${this.familyData.name ?
                  html`
                <div class="family-name-row">
                  <div class="family-name">${Utils.titleCase(this.familyData.name)}</div>
                  
                  ${this.adult ?
                    html`
                  <cal-button
                    .onClick=${() => alert('Button Clicked')} 
                    buttonType="secondary"
                    addStyle="padding-inline: 0.75em;">
                    <i class="fa-solid fa-pen"></i>
                  </cal-button>

                  <cal-button
                    .onClick=${() => alert('Button Clicked')} 
                    buttonType="primary">
                    Leave
                  </cal-button>` :
                    html``
                  }
                </div>` :
                  html`
                <div class="family-name no-family">No associated family</div>
                <cal-button 
                  .onClick=${() => alert('Button Clicked')} 
                  buttonType="primary">
                  Create Family
                </cal-button>`
                }
              </div>
            </div>

            <div class="family-members">
            ${this.familyData.name ?
              html`
              <div class="members-title">
                <h2 class="scroll-box-title">Family Members</h2>
                ${this.adult ?
                  html`
                <cal-button 
                  .onClick=${() => alert('Button Clicked')} 
                  buttonType="secondary"
                  addStyle="padding-inline: 0.75em;">
                  <i class="fa-solid fa-plus"></i>
                </cal-button>` :
                  html``
                }
              </div>
              <div class="members-wrapper data-scroll-box">
              ${this.familyData.users && this.familyData.users.length > 0 ?
                html`
                ${this.familyData.users
                  .filter(item => item.email !== Auth.currentUser.email) // Exclude current user
                  .sort((a, b) => a.accessLevel - b.accessLevel)     // Sort by accessLevel ascending
                  .map(item => html`
                <div style="background: lightgrey; margin-bottom: 1em; padding: 1em;">
                  <span>${Utils.titleCase(item.firstName)}</span>
                  <span>${Utils.titleCase(item.lastName)}</span>
                  <span>- ${userTypes[item.accessLevel]}</span>
                </div>`
                )}` :
                html`<div>No other family members</div>`
              }
              </div>` :
            html``
            }
          </div>
        </div>`
        }
      </div>`
      
        render(template, App.rootEl);
    }
}

export default new FamilyView()