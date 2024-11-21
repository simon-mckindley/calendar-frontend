import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Toast from './../../Toast'
import Utils from './../../Utils'
import UserAPI from '../../UserAPI'
import EventAPI from '../../EventAPI'

// Non admin user home page
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

    // Set all day text 
    document.querySelector(".all-day-wrap").style.display =
      displayEvent.allDay ? "" : "none";

    // Set the start and end dates
    document.getElementById("start-date").textContent =
      Utils.formatDateTimeAU(displayEvent.start);
    if (displayEvent.end) {
      document.getElementById("end-cont").style = "";
      document.getElementById("end-date").textContent =
        Utils.formatDateTimeAU(displayEvent.end);
    } else {
      document.getElementById("end-cont").style.display = "none";
    }

    // Set the event description
    if (displayEvent.description) {
      document.getElementById("event-description").innerHTML =
        Utils.formatTextWithLineBreaks(Utils.titleCase(displayEvent.description));
    } else {
      document.getElementById("event-description").textContent = "No description provided";
    }

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
              <h1>Hi ${Utils.titleCase(Auth.currentUser.firstName)}</h1>
              <div class="button-wrapper">
                <cal-button
                  buttonType="secondary"
                  addStyle="width: 100%"
                  .onClick=${() => gotoRoute('/calendar')}
                >Calendar</cal-button>

                <cal-button
                  buttonType="secondary"
                  addStyle="width: 100%;"
                  .onClick=${() => gotoRoute('/account')}
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
            </div>

            <div class="display-box">
              <h2 class="events-title scroll-box-title">Upcoming Events</h2>
              <div class="events-wrapper data-scroll-box">
              ${this.events && this.events.length > 0
            ? this.events
              .filter(event => new Date(event.start) > new Date()) // Filter for future events
              .sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort by start time ascending
              .map(item => html`
                <data-tile 
                  label=${Utils.titleCase(item.title)} 
                  date=${Utils.formatDateTimeAU(item.start)} 
                  .onClick=${() => this.displayEvent(item)}>
                </data-tile>
              `)
            : html`<div>No current events</div>`
          }
              </div>
            </div>
          </div>
          
          <!---------- Dialog box to show event details ------------->
          <sl-dialog id="dialog-show-event">
            <sl-tooltip content="Go to Calendar" slot="header-actions">
              <button type="button" @click=${() => gotoRoute('/calendar')} class="calendar-link">
                <i class="fa-regular fa-calendar"></i>
              </button>
            </sl-tooltip>

            <div class="show-event-body">
              <div class="all-day-wrap">
                <i class="fa-regular fa-calendar-check"></i>
                <span>All Day Event</span>
              </div>

              <div class="event-dates">
                <div>
                  <i class="fa-regular fa-clock" style="color: var(--secondary-color);"></i> 
                  <span id="start-date"></span>
                </div>
                <div id="end-cont">To <span id="end-date"></span></div>
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
          </sl-dialog>
      `}
      </div>`
    render(template, App.rootEl)
  }
}

export default new UserHomeView()