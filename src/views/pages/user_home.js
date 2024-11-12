import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'
import UserAPI from '../../UserAPI'
import EventAPI from '../../EventAPI'

class UserHomeView {
  init() {
    console.log('UserHomeView.init');
    document.title = 'Home';
    this.events = null;
    this.render();
    Utils.pageIntroAnim();
    this.getEvents();
  }


  hideDialog(id) {
    const dialog = document.getElementById(id);
    dialog.hide();
  }


  async getEvents() {
    try {
      const user = await UserAPI.getUser(Auth.currentUser.id);
      user.events
        ? this.events = user.events
        : this.events = [];

      this.render();
    } catch (err) {
      Toast.show('Error getting user events', 'error');
    }
  }


  async displayEvent(selectedEvent) {
    const displayEvent = await EventAPI.getEvent(selectedEvent._id);

    const dialog = document.getElementById('dialog-show-event');

    // Set the start and end dates
    document.getElementById("start-date").textContent =
      Utils.formatDateTimeAU(displayEvent.startDate);
    document.getElementById("end-date").textContent =
      Utils.formatDateTimeAU(displayEvent.endDate);

    // Set the event description
    document.getElementById("event-description").textContent =
      Utils.titleCase(displayEvent.description) || "No description provided.";

    // Set the event participants
    const participantsContainer = document.getElementById("event-participants");
    participantsContainer.innerHTML = ""; // Clear any existing content

    if (displayEvent.users && displayEvent.users.length > 0) {
      displayEvent.users.forEach(participant => {
        const participantDiv = document.createElement("div");
        participantDiv.textContent = Utils.titleCase(participant.firstName);
        participantsContainer.appendChild(participantDiv);
      });
    } else {
      participantsContainer.textContent = "No participants added.";
    }

    dialog.setAttribute("label", `${Utils.titleCase(displayEvent.title)}`);

    dialog.show();
  }


  render() {
    const template = html`
      <main-header></main-header>
      
      <div class="page-content page-centered">
      ${this.events == null
        ? html`<main-spinner></main-spinner>`
        : html`
          <div class="userhome-wrapper">

            <div class="links-wrapper">
              <cal-button
                buttonType="secondary"
                addStyle="width: 100%"
                .onClick=${() => gotoRoute('/calendar')}
              >Calendar</cal-button>

              <cal-button
                buttonType="secondary"
                addStyle="width: 100%;"
                .onClick=${() => gotoRoute('/')}
              >Account</cal-button>

              <div style="position: relative;">
                <cal-button
                  buttonType="secondary"
                  addStyle="width: 100%;"
                  .onClick=${() => gotoRoute('/family')}
                >Family</cal-button>
        ${Auth.currentUser.invitation
            ? html`
                <sl-badge class="alert-pill" variant="danger" pill pulse>!</sl-badge>`
            : html``
          }
              </div>
            </div>

            <h2 class="events-title scroll-box-title">Upcoming Events</h2>
            <div class="events-wrapper data-scroll-box">
            ${this.events && this.events.length > 0
            ? this.events
              .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Sorts by startDate ascending
              .map(item => html`
              <data-tile 
                label=${Utils.titleCase(item.title)} 
                date=${Utils.formatDateTimeAU(item.startDate)} 
                .onClick=${() => this.displayEvent(item)}>
              </data-tile>
            `)
            : html`<div>No current events</div>`
          }
            </div>

          </div>
          
          <!-- Dialog box to show family members details -->
          <sl-dialog id="dialog-show-event" style="--body-spacing: 0">
            <div class="show-event-body" style="padding-inline: 1.5rem;">
              <div class="event-dates">
                <div>Start: <span id="start-date"></span></div>
                <div>End: <span id="end-date"></span></div>
              </div>

              <div>
                <div class="data-label">Description</div>
                <div id="event-description"></div>
              </div>

              <div>
                <div class="data-label">Participants</div>
                <div id="event-participants"></div>
              </div>
            </div>

            <cal-button
              slot="footer"
              .onClick="${() => this.hideDialog('dialog-show-event')}" 
              buttonType="secondary">
              Close
            </cal-button>
          </sl-dialog>`
      }
      </div>`
    render(template, App.rootEl)
  }
}

export default new UserHomeView()