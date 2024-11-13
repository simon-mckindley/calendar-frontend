import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'
import Toast from '../../Toast'
import UserAPI from '../../UserAPI'
import FamilyAPI from '../../FamilyAPI'

let formData;

class FamilyView {
  init() {
    console.log('FamilyView.init');
    document.title = 'Family';
    formData = {};
    this.familyData = null;
    this.adult = Auth.currentUser.accessLevel === 2;
    this.isOnlyAdult = true;
    this.invitationFamily = null;
    this.render();
    Utils.pageIntroAnim();
    this.getInvitationFamily();
    this.getFamily();
  }

  async getFamily() {
    try {
      if (Auth.currentUser.family) {
        this.familyData = await FamilyAPI.getFamily(Auth.currentUser.family);
        this.getIsOnlyAdult();
      } else {
        this.familyData = {};
      }
      this.render();
    } catch (err) {
      Toast.show(err, 'error');
    }
  }

  async getInvitationFamily() {
    try {
      Auth.currentUser.invitation
        ? this.invitationFamily = await FamilyAPI.getFamily(Auth.currentUser.invitation)
        : this.invitationFamily = null;

      this.render();
    } catch (err) {
      console.log("Invitation family error ", err);
    }
  }

  getIsOnlyAdult() {
    this.familyData.users.forEach(user => {
      if (user._id !== Auth.currentUser.id && user.accessLevel === 2) {
        this.isOnlyAdult = false;
        return;
      }
    });
  }

  showDialog(id) {
    const dialog = document.getElementById(id);
    dialog.show();
  }

  hideDialog(id) {
    const dialog = document.getElementById(id);
    dialog.hide();
  }


  async getEvents(userId) {
    try {
      let events = null;
      const user = await UserAPI.getUser(userId);
      user.events
        ? events = user.events
        : events = [];

      return events;
    } catch (err) {
      console.log(err);
      Toast.show('Error getting user events', 'error');
    }
  }


  async displayFamilyMember(displayUser) {
    const dialog = document.getElementById('dialog-show-member');

    const today = new Date();
    let nextEvent = null;

    const userEvents = await this.getEvents(displayUser._id);

    userEvents.forEach((evnt) => {
      const eventStartDate = new Date(evnt.start); // Ensure start is a Date object
      if (eventStartDate > today && (!nextEvent || eventStartDate < new Date(nextEvent.start))) {
        nextEvent = evnt;
      }
    });

    document.getElementById("show-next-event").innerHTML = nextEvent
      ? `Next Event:<br>
        <span class="event-title">${Utils.titleCase(nextEvent.title)}</span><br><br>
        <i class="fa-regular fa-clock"></i> 
        <span>${Utils.formatDateTimeAU(nextEvent.start)}</span><br><br>
        ${Utils.formatTextWithLineBreaks(Utils.titleCase(nextEvent.description))}`
      : "No upcoming events";

    document.getElementById("display-avatar").image = displayUser.avatar
      ? `${App.apiBase}/images/${Auth.currentUser.avatar}` : '';


    dialog.setAttribute("label", `${Utils.titleCase(displayUser.firstName)} ${Utils.titleCase(displayUser.lastName)}`);

    dialog.show();
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
    const input = document.getElementById('edit-input');

    if (formData[field]) {
      formData[field] = formData[field].trim();
    }

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
    try {
      await FamilyAPI.updateFamily(this.familyData._id, encodedFormData);

      document.getElementById('dialog-edit-family').hide();
      this.getFamily();
      input.value = '';
      formData = {};
    } catch (error) {
      console.log(error);
    }
  }


  // Handle creation submission
  async createFamilyHandler() {
    // Checks if data is present
    const field = 'name';
    const input = document.getElementById('create-input');

    if (formData[field]) {
      formData[field] = formData[field].trim();
    }

    if (!formData[field]) {
      input.setAttribute("hasError", "true");
      Toast.show(`Please enter the ${field.toUpperCase()}`, 'error');
      return;
    }

    formData.users = [Auth.currentUser.id];

    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        // Convert array to JSON string
        const value = Array.isArray(formData[key]) ? JSON.stringify(formData[key]) : formData[key];
        encodedFormData.append(key, value);
      }
    }

    // call api's
    try {
      const familyData = await FamilyAPI.createFamily(encodedFormData);
      await FamilyAPI.addUser(
        familyData.family._id,
        Auth.currentUser.id,
        "Associated to family");

      const userData = await UserAPI.getUser(Auth.currentUser.id);
      Auth.currentUser.family = userData.family;

      document.getElementById('dialog-create-family').hide();
      this.getFamily();
      input.value = '';
      formData = {};

    } catch (error) {
      console.log(error);
    }

  }


  async removeFamilyHandler() {
    if (this.isOnlyAdult) return;

    try {
      await FamilyAPI.removeUser(Auth.currentUser.family, Auth.currentUser.id);

      const userData = await UserAPI.getUser(Auth.currentUser.id);
      Auth.currentUser.family = userData.family;

      document.getElementById('dialog-leave-family').hide();
      this.getFamily();

    } catch (error) {
      console.log(error);
    }

  }


  async sendInvitationHandler() {
    // Checks if data is present
    const field = 'email';
    const input = document.getElementById('invite-input');

    if (formData[field]) {
      formData[field] = formData[field].trim();
    }

    if (!formData[field]) {
      input.setAttribute("hasError", "true");
      Toast.show(`Please enter the ${field.toUpperCase()} address`, 'error');
      return;
    }

    // Validates email address
    if (!Utils.validateEmail(formData[field])) {
      input.setAttribute("hasError", "true");
      Toast.show(`Please enter a valid ${field.toUpperCase()} address`, 'error');
      return;
    }

    try {
      const userData = await UserAPI.getUserByEmail(formData[field]);
      let invite = new FormData();
      invite.append("invitation", Auth.currentUser.family);

      await UserAPI.updateUser(
        userData._id,
        invite,
        `Invitation sent to ${Utils.titleCase(userData.firstName)}`
      );

      document.getElementById('dialog-invite-member').hide();
      input.value = '';
      formData = {};

    } catch (error) {
      console.log(error);
    }
  }


  async acceptInvitationHandler() {
    try {
      await FamilyAPI.addUser(
        this.invitationFamily._id,
        Auth.currentUser.id,
        "Family invitation accepted");

      await UserAPI.removeInvitation(Auth.currentUser.id, this.invitationFamily._id);

      Auth.currentUser.family = this.invitationFamily._id;
      Auth.currentUser.invitation = "";
      this.getFamily();
      this.getInvitationFamily();

    } catch (error) {
      console.log(error);
    }
  }


  async declineInvitationHandler() {
    try {
      await UserAPI.removeInvitation(
        Auth.currentUser.id,
        this.invitationFamily._id,
        "Family invitation declined");

      Auth.currentUser.invitation = "";
      this.getInvitationFamily();

    } catch (error) {
      console.log(error);
    }
  }


  render() {
    const template = html`
    <main-header></main-header>

    <div class="page-content page-centered">
      ${this.familyData == null
        ? html`<main-spinner></main-spinner>`
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
                              .onClick="${() => this.showDialog('dialog-edit-family')}" 
                              buttonType="secondary"
                              addStyle="padding-inline: 0.6em;">
                              <i class="fa-solid fa-pen"></i>
                            </cal-button>
                          </sl-tooltip>

                          ${this.isOnlyAdult
                    ? html``
                    : html`
                          <sl-tooltip content="Leave family">
                            <cal-button
                              .onClick="${() => this.showDialog('dialog-leave-family')}" 
                              buttonType="primary"
                              addStyle="padding-inline: 0.7em;">
                              <i class="fa-solid fa-xmark"></i>
                            </cal-button>
                          </sl-tooltip>
                          `}
                          `
                : html``}
                    </div>`
            : html`
                    <div class="family-name no-family">No associated family</div>
                    <cal-button 
                      .onClick="${() => this.showDialog('dialog-create-family')}" 
                      buttonType="primary">
                      Create Family
                    </cal-button>`
          }
              </div>

              ${this.invitationFamily
            ? html`
              <div class="invitation-wrapper">
                <div class="invitation-text">
                  You have been invited to the 
                  <span> ${Utils.titleCase(this.invitationFamily.name)} </span>
                  family
                </div>

                <div class="invitation-buttons">
                  <sl-tooltip content="Accept invitation">
                    <cal-button
                      id="invite-accept"
                      .onClick="${() => this.acceptInvitationHandler()}" 
                      addStyle="padding-inline: 0.7em;"
                      buttonType="primary">
                      <i class="fa-solid fa-check"></i>
                    </cal-button>
                  </sl-tooltip>

                  <sl-tooltip content="Decline invitation">
                    <cal-button
                      id="invite-decline"
                      .onClick="${() => this.declineInvitationHandler()}"
                      addStyle="padding-inline: 0.7em;"
                      buttonType="secondary">
                      <i class="fa-solid fa-xmark"></i>
                    </cal-button>
                  <sl-tooltip>
                </div>
                <sl-badge class="alert-pill" variant="danger" pill pulse>!</sl-badge>
              </div>`
            : html``
          }
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
                            .onClick="${() => this.showDialog('dialog-invite-member')}" 
                            buttonType="secondary"
                            addStyle="padding-inline: 0.7em;">
                            <i class="fa-solid fa-plus"></i>
                          </cal-button>
                        </sl-tooltip>`
                : html``}
                  </div>

                  <div class="members-wrapper data-scroll-box">
                    ${this.familyData.users && this.familyData.users.length > 1
                ? html`
                        ${this.familyData.users
                    .filter(item => item.email !== Auth.currentUser.email) // Exclude current user
                    .sort((a, b) => a.accessLevel - b.accessLevel) // Sort by accessLevel ascending
                    .map(member => html`
                      <user-tile 
                        .user="${member}"
                        .onClick="${() => this.displayFamilyMember(member)}" >
                      </user-tile>`)}`
                : html`<div>No other family members</div>`}
                  </div>`
            : html``}
            </div>
          </div>
          
          <!-- --------------------  Dialogs -------------------------- -->
          
          <!-- Dialog box to edit the family name -->
          <sl-dialog label="Edit family name" id="dialog-edit-family">
            <cal-input
              id="edit-input"
              placeholder=${Utils.titleCase(this.familyData.name)} 
              name="name" type="text"
              addStyle="margin-block-end: 1rem;"
              @input-change=${this.handleInputChange}>
            </cal-input>

            <cal-button
              id="update-submit"
              slot="footer"
              addStyle="margin-inline-end: 1rem;"
              .onClick="${() => this.updateFamilyHandler()}" 
              buttonType="primary">
              Save
            </cal-button>

            <cal-button
              slot="footer"
              .onClick="${() => this.hideDialog('dialog-edit-family')}" 
              buttonType="secondary">
              Cancel
            </cal-button>
          </sl-dialog>
          

          <!-- Dialog box to confirm leaving associated family -->
          <sl-dialog label="Leave your associated family?" id="dialog-leave-family">
            If you leave this family, you'll need an invitation from a current member to rejoin.

            <cal-button
              id="leave-submit"
              slot="footer"
              addStyle="margin-inline-end: 1rem;"
              .onClick="${() => this.removeFamilyHandler()}"
              buttonType="primary">
              Leave
            </cal-button>

            <cal-button
              slot="footer"
              .onClick="${() => this.hideDialog('dialog-leave-family')}" 
              buttonType="secondary">
              Cancel
            </cal-button>
          </sl-dialog>
          
          
          <!-- Dialog box to invite users to the family -->
          <sl-dialog label="Invite a new member to your family group" id="dialog-invite-member">
            Enter the email address of the user you would like to invite to this family.
            <cal-input
              id="invite-input"
              placeholder="Email" 
              name="email" type="email"
              addStyle="margin: 0.75rem 0 1rem 0; "
              @input-change=${this.handleInputChange}>
            </cal-input>

            <cal-button
              id="invite-submit"
              slot="footer"
              addStyle="margin-inline-end: 1rem;"
              .onClick="${() => this.sendInvitationHandler()}" 
              buttonType="primary">
              Invite
            </cal-button>

            <cal-button
              slot="footer"
              .onClick="${() => this.hideDialog('dialog-invite-member')}" 
              buttonType="secondary">
              Cancel
            </cal-button>
          </sl-dialog>
          
          
          <!-- Dialog box to show family members details -->
          <sl-dialog id="dialog-show-member" style="--width: fit-content">        
            <div class="show-member-body">
              <sl-avatar id="display-avatar" style="--size: 6rem;"></sl-avatar>
              <div id="show-next-event">
              </div>
            </div>

            <cal-button
              slot="footer"
              .onClick="${() => this.hideDialog('dialog-show-member')}" 
              buttonType="secondary">
              Close
            </cal-button>
          </sl-dialog>
          
          
          <!-- Dialog box to create a new family -->
          <sl-dialog label="Create a new family group" id="dialog-create-family">
            <cal-input
              id="create-input"
              label="Family name" 
              name="name" type="text"
              addStyle="margin-block-end: 1rem;"
              @input-change=${this.handleInputChange}>
            </cal-input>

            <cal-button
              id="create-submit"
              slot="footer"
              addStyle="margin-inline-end: 1rem;"
              .onClick="${() => this.createFamilyHandler()}" 
              buttonType="primary">
              Create
            </cal-button>

            <cal-button
              slot="footer"
              .onClick="${() => this.hideDialog('dialog-create-family')}" 
              buttonType="secondary">
              Cancel
            </cal-button>
          </sl-dialog>`
      }
    </div>`;

    render(template, App.rootEl);
  }
}

export default new FamilyView()