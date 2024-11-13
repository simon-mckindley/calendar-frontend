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
      const calendarEl = document.getElementById('calendar')

      if (calendarEl) {
        const calendar = new Calendar(calendarEl, {
          initialView: 'dayGridMonth',  // 'dayGridWeek', 'timeGridDay', 'listWeek'
          headerToolbar: {
            start: 'prev today', // will normally be on the left. if RTL, will be on the right
            center: 'title',
            end: 'timeGridDay dayGridWeek dayGridMonth next' // will normally be on the right. if RTL, will be on the left
          },
          locale: 'en-au',
          events: this.events
        });
        // console.log(calendar);
        calendar.render();  // Render the calendar

        calendar.on('dateClick', function (info) {
          console.log('clicked on ' + info.dateStr);
          calendar.changeView('timeGridDay', info.date);
        });

      } else {
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


  createEventHandler() {
    // Checks if all data is present
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

    const result = Utils.validateDates(new Date(formData.start), new Date(formData.end));
    if (!result.valid) {
      document.querySelector(`cal-input[name="start"]`).setAttribute("hasError", "true");
      document.querySelector(`cal-input[name="end"]`).setAttribute("hasError", "true");
      Toast.show(result.message, 'error');
      return;
    }

    const allDay = document.querySelector(".all-day-input");
    if (allDay.checked) formData.allDay = true;

    formData.users = usersArray;

    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        // Convert array to JSON string
        const value = Array.isArray(formData[key]) ? JSON.stringify(formData[key]) : formData[key];
        encodedFormData.append(key, value);
      }
    }

    try {
      EventAPI.createEvent(encodedFormData);
      this.resetCreateForm();
      formData = {};
      document.getElementById('dialog-create-event').hide();

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
          
          <div id='calendar' style="padding: 2rem 4rem;"></div>

          <!-- --------------------  Dialogs -------------------------- -->
          
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

              <sl-checkbox class="all-day-input">All Day Event</sl-checkbox>
              
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
        `}
    </div>
  `;
    render(template, App.rootEl);
  }

}


export default new CalendarView()