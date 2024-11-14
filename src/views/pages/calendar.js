import App from '../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import Toast from '../../Toast'
import FamilyAPI from '../../FamilyAPI'
import EventAPI from '../../EventAPI'
import { Calendar } from 'fullcalendar'
import UserAPI from '../../UserAPI'

let formData;


class CalendarView {
  constructor() {
    this.calendar = null;  // Declare calendar as a class property
  }

  init() {
    document.title = 'Calendar';
    formData = {};
    this.events = null;
    this.familyData = null;
    this.render();
    Utils.pageIntroAnim();
    this.getFamily();
    this.getAllEvents();
  }


  showCalendar() {
    // Wait for the DOM to update before querying the element
    setTimeout(() => {
      const calendarEl = document.getElementById('calendar');

      if (calendarEl && !this.calendar) {  // Initialize only if calendar is not already created
        this.calendar = new Calendar(calendarEl, {
          initialView: 'dayGridMonth',

          headerToolbar: {
            start: 'prev today',
            center: 'title',
            end: 'timeGridDay dayGridWeek dayGridMonth next'
          },

          locale: 'en-au',

          events: this.events,

          eventClick: (el) => {
            this.displayEvent(el.event._def.extendedProps._id);
          },

          dateClick: (info) => {
            this.calendar.changeView('timeGridDay', info.date);
          },
        });

        this.calendar.render();  // Render the calendar

      } else if (!calendarEl) {
        console.error("Calendar element not found");
      }
    }, 10);
  }


  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }


  async getFamily() {
    try {
      if (Auth.currentUser.family) {
        this.familyData = await FamilyAPI.getFamily(Auth.currentUser.family);
      }
    } catch (err) {
      Toast.show(err, 'error');
    }
  }


  async getAllEvents() {
    try {
      // Initialize events with the current user's events
      const currentUserData = await UserAPI.getUser(Auth.currentUser.id);
      this.events = currentUserData.events;

      if (this.familyData) {

        // Create a Set to track unique event IDs
        const uniqueEventIds = new Set(this.events.map(event => event._id));

        // Fetch events for each family member and add unique events
        for (const user of this.familyData.users) {
          if (user._id !== Auth.currentUser.id) {
            const userData = await UserAPI.getUser(user._id);

            userData.events.forEach(event => {
              if (!uniqueEventIds.has(event._id)) {
                this.events.push(event);
                uniqueEventIds.add(event._id); // Add to the Set to avoid future duplicates
              }
            });
          }
        }

      }

      console.log(this.events);
      this.render();
      this.createUserCheckboxes();
      this.showCalendar();

    } catch (err) {
      Toast.show(err, 'error');
    }
  }



  createUserCheckboxes() {
    // Get the container element where checkboxes and labels will be appended
    const container = document.getElementById("checkbox-wrapper");

    // Clear any existing content in the container
    container.innerHTML = '';

    let sortedUsers = [{
      _id: Auth.currentUser.id,
      email: Auth.currentUser.email,
      firstName: Auth.currentUser.firstName
    }];

    if (this.familyData) {
      // Sort users alphabetically by firstName
      sortedUsers = [...this.familyData.users].sort((a, b) =>
        a.firstName.localeCompare(b.firstName)
      );
    }

    // Iterate through each sorted user and create the checkbox and label
    sortedUsers.forEach(user => {
      // Create the checkbox input element
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = user.email;
      checkbox.name = 'participant';
      checkbox.value = user._id;
      checkbox.checked = user._id === Auth.currentUser.id;

      // Create the label element
      const label = document.createElement('label');
      label.className = 'checkbox-label';
      label.htmlFor = user.email;
      label.textContent = Utils.titleCase(user.firstName);

      // Append the checkbox and label to the container
      container.appendChild(checkbox);
      container.appendChild(label);
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


  resetCreateForm() {
    const inputs = document.querySelectorAll(".create-event-form cal-input");
    if (inputs) {
      inputs.forEach(input => input.value = "");
    }

    const textinp = document.querySelector(".create-event-form cal-textinput");
    if (textinp) textinp.value = "";

    const checkboxes = document.querySelectorAll('.create-event-form input[type="checkbox"]');
    if (checkboxes) {
      checkboxes.forEach(checkbox => {
        checkbox.checked = checkbox.value === Auth.currentUser.id;
      });
    }
  }


  allDayOnclick(checkbox) {
    const endInput = document.querySelector('cal-input[name="end"]');

    if (endInput) {
      if (checkbox.checked) {
        endInput.setAttribute('disabled', 'true');
        endInput.value = "";
        formData.end = "";
      } else {
        endInput.removeAttribute('disabled');
      }
    }
  }

  // Creates a new event for the user
  async createEventHandler() {
    // Checks if all required data is present
    let error = "";
    const fields = ['title', 'start', 'description'];

    fields.forEach(field => {
      if (formData[field]) {
        formData[field] = formData[field].trim();
      }

      if (field !== "description" && !formData[field]) {
        document.querySelector(`cal-input[name="${field}"]`).setAttribute("hasError", "true");
        let fieldName = field.includes('start') ? field.concat(" date") : field;
        error += error ? `, ${fieldName.toUpperCase()}` : fieldName.toUpperCase();
      }
    });

    // Validates checkboxes
    const userCheckboxes = document.querySelectorAll('input[name="participant"]');
    let usersArray = [];
    if (userCheckboxes) {
      userCheckboxes.forEach(box => {
        if (box.checked) {
          usersArray.push(box.value);
        }
      });
    }

    if (usersArray.length === 0) {
      error += error ? ', USER' : 'USER';
    }

    if (error) {
      Toast.show(`Please enter the ${error}`, 'error');
      return;
    }

    // Validates dates
    const result = Utils.validateDates(new Date(formData.start), new Date(formData.end));
    if (!result.valid) {
      document.querySelector(`cal-input[name="start"]`).setAttribute("hasError", "true");
      document.querySelector(`cal-input[name="end"]`).setAttribute("hasError", "true");
      Toast.show(result.message, 'error');
      return;
    }

    // Add allDay and users to formdata
    const allDay = document.querySelector(".all-day-input");
    if (allDay.checked) formData.allDay = true;

    formData.users = usersArray;

    // Encode formData
    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        // Convert array to JSON string
        const value = Array.isArray(formData[key]) ? JSON.stringify(formData[key]) : formData[key];
        encodedFormData.append(key, value);
      }
    }

    try {
      // Add event to database
      const eventData = await EventAPI.createEvent(encodedFormData);
      this.resetCreateForm();
      formData = {};
      document.getElementById('dialog-create-event').hide();
      // Add event to calendar
      this.calendar.addEvent(eventData.event);

    } catch (error) {
      console.log(error);
    }
  }


  async displayEvent(eventId) {
    const displayEvent = await EventAPI.getEvent(eventId);

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
    
    <div class="page-content">
      ${this.events == null
        ? html`
        <div class="page-centered" style="height: 80vh;">
          <main-spinner></main-spinner>
        </div>`
        : html`
          <div class="calendar-head">    
            <cal-button 
              class="create-btn"
              addStyle="width: 100%;"
              .onClick=${() => this.showDialog("dialog-create-event")} 
              buttonType="primary">
              Create Event
            </cal-button>
          </div>
          
          <div id='calendar' style="padding: 2rem 0rem;"></div>

          <!-- --------------------  Dialogs -------------------------- -->
          <!-- Create / Edit event dialog -->
          <sl-dialog label="Create event" id="dialog-create-event" style="--width: fit-content;">
            <form class="create-event-form">
              <cal-input 
                label="Event Title" 
                name="title" 
                type="text"
                @input-change=${this.handleInputChange}>
              </cal-input>
              
              <div class="date-inputs">
                <cal-input 
                  label="Start" 
                  name="start" 
                  type="datetime-local"
                  @input-change=${this.handleInputChange}>
                </cal-input>
                <cal-input 
                  label="End" 
                  name="end" 
                  type="datetime-local"
                  @input-change=${this.handleInputChange}>
                </cal-input>
              </div>

              <sl-checkbox 
                class="all-day-input"
                @input="${(event) => this.allDayOnclick(event.target)}"
                >All Day Event
              </sl-checkbox>
              
              <cal-textinput 
                label="Description" 
                name="description"
                @input-change=${this.handleInputChange}>
              </cal-textinput>

              <div>
                <div class="input-label">Participants</div>          
                <div id="checkbox-wrapper"></div>
              </div>
            </form>

            <cal-button
              id="create-submit"
              slot="footer"
              addStyle="min-width: 8rem; margin-inline-end: 1rem;"
              .onClick=${() => this.createEventHandler()} 
              buttonType="primary">
              Save
            </cal-button>

            <cal-button
              slot="footer"
              addStyle="min-width: 8rem;"
              .onClick=${() => this.hideDialog('dialog-create-event')} 
              buttonType="secondary">
              Cancel
            </cal-button>
          </sl-dialog>


           <!---------- Dialog box to show event details ------------->
          <sl-dialog id="dialog-show-event" style="--body-spacing: 0">
            <div class="show-event-body">
              <div class="all-day-wrap">
                <i class="fa-regular fa-calendar-check"></i>
                <span>All Day Event</span>
              </div>

              <div class="event-dates">
                <div><i class="fa-regular fa-clock"></i> <span id="start-date"></span></div>
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
              id="edit-btn"
              slot="footer"
              addStyle="margin-inline-end: 1rem;"
              .onClick="${() => this.createFamilyHandler()}" 
              buttonType="primary">
              Edit
            </cal-button>

            <cal-button
              slot="footer"
              .onClick="${() => this.hideDialog('dialog-show-event')}" 
              buttonType="secondary">
              Close
            </cal-button>
          </sl-dialog>
        `}
    </div>
  `;
    render(template, App.rootEl);
  }

}


export default new CalendarView()