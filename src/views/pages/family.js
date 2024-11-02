import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'
import DataAPI from '../../DataAPI'

let userTypes = { 2: "Adult", 3: "Child" };

class FamilyView {
    async init() {
        console.log('FamilyView.init');
        document.title = 'Family';
        this.familyData = await DataAPI.getFamily(Auth.currentUser.family);
        this.render();
        Utils.pageIntroAnim();
    }

    render() {
        const template = html`
        <main-header></main-header>

        <div class="page-content page-centered">
          <div class="user-header">
            <h2>${Auth.currentUser.firstName} ${Auth.currentUser.lastName}</h2>
            <h2>${Auth.currentUser.email}</h2>
          </div>

          <div class="family-wrapper">
            <div class="family-title">
                <span>Family</span>
                <h2>${Utils.titleCase(this.familyData.name)}</h2>
            </div>

          <div class="family-members">
            ${this.familyData.users ? 
                html`<div>Family Members</div>` :
                html``
            }
            ${this.familyData.users
                .filter(item => item.email !== Auth.currentUser.email) // Exclude current user
                .sort((a, b) => a.accessLevel - b.accessLevel)     // Sort by accessLevel ascending
                .map(item => html`
                    <div style="background: lightgrey; margin-bottom: 1em; padding: 1em;">
                      <span>${Utils.titleCase(item.firstName)}</span>
                      <span>${Utils.titleCase(item.lastName)}</span>
                      <span>- ${userTypes[item.accessLevel]}</span>
                    </div>`
            )}
          </div>

        </div>`
        render(template, App.rootEl)
    }
}

export default new FamilyView()