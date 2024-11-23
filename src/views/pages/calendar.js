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

  async init() {
    document.title = 'Calendar';

    formData = {};
    this.displayEvent = null;
    this.events = null;
    this.familyData = null;

    this.render(); // Initial UI rendering
    Utils.pageIntroAnim();

    // Fetch data and initialize calendar after data is ready
    await this.getFamily();
  }

  // Creates and renders the calendar
  showCalendar() {
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

        // Shows the event dialog
        eventClick: (el) => {
          this.displayEventHandler(el.event._def.publicId);
        },

        // Changes to day view
        dateClick: (info) => {
          this.calendar.changeView('timeGridDay', info.date);
        },
      });

      setTimeout(() => {
        this.calendar.render();  // Render the calendar
      }, 100);

    } else if (!calendarEl) {
      console.error("Calendar element not found");
    }
  }


  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }


  // Gats data for the associated family
  async getFamily() {
    try {
      if (Auth.currentUser.family) {
        this.familyData = await FamilyAPI.getFamily(Auth.currentUser.family);
      }
      this.getAllEvents();

    } catch (err) {
      Toast.show(err, 'error');
    }
  }


  // Creates an array of all events for the associated family for the calendar
  async getAllEvents() {
    try {
      // Initialize events with the current user's events
      const currentUserData = await UserAPI.getUser(Auth.currentUser.id);
      this.events = currentUserData.events.map(event => ({
        ...event,
        className: "current-user-event" // Add className for current user events
      }));

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

      // Rename "_id" to "id" for each object
      this.events = this.events.map(({ _id, ...rest }) => ({
        id: _id,
        ...rest
      }));

      this.render();
      setTimeout(() => {
        this.createUserCheckboxes();
        this.showCalendar();
      }, 3000);

    } catch (err) {
      Toast.show(err, "error");
    }
  }


  // Creates the checkboxes in the event form for each family member
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


  // Clears and resets the form elements
  resetCreateForm() {
    const dialog = document.getElementById("dialog-create-event");
    dialog.setAttribute("label", "Create event");

    const submitBtn = dialog.querySelector('#create-submit');
    if (submitBtn) {
      submitBtn.onClick = () => this.createEventHandler();
    }

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

  closeCreateDialog() {
    this.hideDialog('dialog-create-event');
    this.resetCreateForm();
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

  // Create a new event
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
    if (allDay.checked) {
      formData.allDay = true;
      delete formData['end'];
    }

    formData.users = usersArray;

    // Removes blank value entries
    Object.keys(formData).forEach(key => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

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
      const eventData = await EventAPI.createEvent(encodedFormData);
      formData = {};
      document.getElementById('dialog-create-event').hide();
      this.resetCreateForm();

      // Rename "_id" to "id" for each object
      const updatedEvent = { id: eventData.event._id, ...eventData.event };
      delete updatedEvent._id;

      // Add event to calendar
      this.calendar.addEvent(updatedEvent);

    } catch (error) {
      console.log(error);
    }
  }


  // Update an existing event
  async updateEventHandler(eventId) {
    // Checks if all required data is present
    let error = "";
    const fields = ['title', 'start', 'description'];

    for (const key in formData) {
      formData[key] = formData[key].trim();

      if (key !== "description" && key !== "end" && !formData[key]) {
        document.querySelector(`cal-input[name="${key}"]`).setAttribute("hasError", "true");
        let fieldName = key.includes('start') ? key.concat(" date") : key;
        error += error ? `, ${fieldName.toUpperCase()}` : fieldName.toUpperCase();
      }
    }

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

    if (formData.start || formData.end) {
      // Validates dates
      const result = Utils.validateDates(new Date(formData.start), new Date(formData.end));
      if (!result.valid) {
        document.querySelector(`cal-input[name="start"]`).setAttribute("hasError", "true");
        document.querySelector(`cal-input[name="end"]`).setAttribute("hasError", "true");
        Toast.show(result.message, 'error');
        return;
      }
    }

    // Add allDay and users to formdata
    const allDay = document.querySelector(".all-day-input");
    if (allDay.checked) formData.allDay = true;

    formData.users = usersArray;

    // Removes blank value entries
    Object.keys(formData).forEach(key => {
      if (formData[key] === '' || formData[key] === null) {
        delete formData[key];
      }
    });

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
      // Update event in database
      const eventData = await EventAPI.updateEvent(eventId, encodedFormData, "Event updated");

      formData = {};
      document.getElementById('dialog-create-event').hide();
      this.resetCreateForm();

      const existingEvent = this.calendar.getEventById(eventId);
      if (existingEvent) {
        existingEvent.remove(); // Remove the old version if it exists
      }

      // Rename "_id" to "id" for each object
      const updatedEvent = { id: eventData.event._id, ...eventData.event };
      delete updatedEvent._id;

      // Add event to calendar
      this.calendar.addEvent(updatedEvent);

    } catch (error) {
      console.log(error);
    }
  }

  // Adds event data to the event view dialog box before showing it
  async displayEventHandler(eventId) {
    this.displayEvent = await EventAPI.getEvent(eventId);

    const dialog = document.getElementById('dialog-show-event');

    // Set all day text 
    document.querySelector(".all-day-wrap").style.display =
      this.displayEvent.allDay ? "" : "none";

    // Set the start and end dates
    document.getElementById("start-date").textContent =
      Utils.formatDateTimeAU(this.displayEvent.start);
    if (this.displayEvent.end) {
      document.getElementById("end-cont").style = "";
      document.getElementById("end-date").textContent =
        Utils.formatDateTimeAU(this.displayEvent.end);
    } else {
      document.getElementById("end-cont").style.display = "none";
    }

    // Set the event description
    if (this.displayEvent.description) {
      document.getElementById("event-description").innerHTML =
        Utils.formatTextWithLineBreaks(Utils.titleCase(this.displayEvent.description));
    } else {
      document.getElementById("event-description").textContent = "No description provided";
    }

    // Set the event participants
    const participantsContainer = document.getElementById("event-participants");
    participantsContainer.innerHTML = ""; // Clear any existing content

    if (this.displayEvent.users && this.displayEvent.users.length > 0) {
      this.displayEvent.users.forEach(participant => {
        const participantDiv = document.createElement("div");
        participantDiv.textContent = Utils.titleCase(participant.firstName);
        participantsContainer.appendChild(participantDiv);
      });
    } else {
      participantsContainer.textContent = "No participants added.";
    }

    dialog.setAttribute("label", `${Utils.titleCase(this.displayEvent.title)}`);

    dialog.show();
  }


  // Adds event data to the event form so it can be updated by the user
  populateDialogForm() {
    this.hideDialog('dialog-show-event');

    const dialog = document.getElementById("dialog-create-event");

    if (this.displayEvent) {
      const { _id, title, start, end, allDay, description, users } = this.displayEvent;

      // Format text fields
      const titleFormat = title ? Utils.titleCase(title) : "";
      const descFormat = description ? Utils.titleCase(description) : "";

      // Convert dates to local timezone for datetime-local inputs
      const formatToLocal = (date) => {
        if (!date) return "";
        const localDate = new Date(date); // Parse the ISO date
        // Adjust for local timezone offset, including DST
        const offset = localDate.getTimezoneOffset() * 60000; // Convert offset to milliseconds
        const adjustedDate = new Date(localDate.getTime() - offset); // Adjust for timezone
        return adjustedDate.toISOString().slice(0, 16); // Format as "YYYY-MM-DDTHH:MM"
      };


      const startFormat = formatToLocal(start);
      const endFormat = formatToLocal(end);

      // Populate input fields
      dialog.querySelector('cal-input[name="title"]').value = titleFormat || '';
      dialog.querySelector('cal-input[name="start"]').value = startFormat || '';
      dialog.querySelector('cal-input[name="end"]').value = endFormat || '';
      dialog.querySelector('cal-textinput[name="description"]').value = descFormat || '';

      // Set checkbox state for "All Day Event"
      const allDayCheckbox = dialog.querySelector('.all-day-input');
      if (allDayCheckbox) {
        allDayCheckbox.checked = allDay || false;
        this.allDayOnclick(allDayCheckbox); // Adjust input fields if "All Day" is checked
      }

      // Populate participants checkboxes if they exist
      const checkboxWrapper = dialog.querySelector('#checkbox-wrapper');
      if (checkboxWrapper && users) {
        Array.from(checkboxWrapper.querySelectorAll('input[type="checkbox"]')).forEach(checkbox => {
          checkbox.checked = users.some(user => user._id === checkbox.value);
        });
      }

      const submitBtn = dialog.querySelector('#create-submit');
      if (submitBtn) {
        submitBtn.onClick = () => this.updateEventHandler(_id);
      }

      dialog.setAttribute("label", `Edit - ${Utils.titleCase(title)}`);
      dialog.show();

    } else {
      Toast.show("Error retrieving event", "err");
    }
  }

  // Sets and displays the delete event confirm dialog
  showDeleteConfirmDialog() {
    const dialog = document.getElementById("dialog-delete-event");
    dialog.setAttribute("label", `Delete "${Utils.titleCase(this.displayEvent.title)}"?`);
    dialog.show();
  }

  // Deletes the selected event
  async deleteEventHandler() {
    try {
      const data = await EventAPI.deleteEvent(this.displayEvent._id);

      const existingEvent = this.calendar.getEventById(this.displayEvent._id);
      if (existingEvent) {
        existingEvent.remove(); // Remove the old version if it exists
      }

      this.displayEvent = null;
      this.hideDialog("dialog-delete-event");
      this.hideDialog("dialog-show-event");

    } catch (error) {
      console.log(error);
    }
  }


  render() {
    const template = html`
    <main-header></main-header>
    
    <div class="page-content">
      ${this.events == null
        ? html`
        <div class="page-centered" style="height: 80vh;">
          <main-spinner style="align-content: center;"></main-spinner>
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
          
          <div id='calendar' style="padding: 2rem 0rem;">
            <div style="display: grid; place-items: center; width: 90vw">
              <sl-spinner style="font-size: 2rem; margin-block: 4rem;"></sl-spinner>
            </div>
          </div>

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
                  addStyle="min-width: 4rem;"
                  type="datetime-local"
                  @input-change=${this.handleInputChange}>
                </cal-input>
                <cal-input 
                  label="End" 
                  name="end" 
                  addStyle="min-width: 4rem;"
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
              slot="footer"
              addStyle="min-width: 8rem; margin-inline-end: 1rem;"
              .onClick=${() => this.closeCreateDialog()} 
              buttonType="secondary">
              Cancel
            </cal-button>

            <cal-button
              id="create-submit"
              slot="footer"
              addStyle="min-width: 8rem;"
              .onClick=${() => this.createEventHandler()} 
              buttonType="primary">
              Save
            </cal-button>
          </sl-dialog>


           <!---------- Dialog box to show event details ------------->
          <sl-dialog id="dialog-show-event">
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

            ${Auth.currentUser.accessLevel === 3
            ? html``
            : html`
            <sl-tooltip content="Delete event" slot="footer">
              <cal-button
                id="delete-event-btn"
                .onClick="${() => this.showDeleteConfirmDialog()}" 
                addStyle="padding-inline: 0.7em;"
                buttonType="primary">
                <i class="fa-solid fa-trash-can"></i>
              </cal-button>
            </sl-tooltip>`
          }

            <cal-button
              slot="footer"
              addStyle="min-width: 6rem; margin-inline: 12rem 1rem;"
              .onClick="${() => this.hideDialog('dialog-show-event')}" 
              buttonType="secondary">
              Close
            </cal-button>

            ${Auth.currentUser.accessLevel === 3
            ? html``
            : html`
            <cal-button
              id="edit-btn"
              slot="footer"
              addStyle="min-width: 6rem;"
              .onClick="${() => this.populateDialogForm()}" 
              buttonType="primary">
              Edit
            </cal-button>`
          }
          </sl-dialog>

          <!-- Dialog box to confirm deleting event -->
          <sl-dialog id="dialog-delete-event" style="--width: 40rem">
            <span class="delete-text">
              Deleted events cannot be recovered!
            </span>

            <cal-button
              slot="footer"
              addStyle="margin-inline-end: 1rem;"
              .onClick="${() => this.hideDialog('dialog-delete-event')}" 
              buttonType="secondary">
              Cancel
            </cal-button>

            <cal-button
              id="delete-submit"
              slot="footer"
              .onClick="${() => this.deleteEventHandler()}"
              buttonType="primary">
              Delete
            </cal-button>
          </sl-dialog>
        `}
    </div>
  `;
    render(template, App.rootEl);
  }
}


export default new CalendarView()