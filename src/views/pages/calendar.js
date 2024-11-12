import App from '../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import Toast from '../../Toast'
import FamilyAPI from '../../FamilyAPI'
import EventAPI from '../../EventAPI'
import { Calendar } from 'fullcalendar'

let formData;

class CalendarView {
  init() {
    document.title = 'Calendar';
    formData = {};
    this.familyData = null;
    this.render();
    this.showCalendar();
    Utils.pageIntroAnim();
    this.getFamily();
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
          locale: 'en-au'
        });
        console.log(calendar);
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
      this.createUserCheckboxes();
      this.render();
      console.log(this.familyData);
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


  createEventHandler() {
    // Checks if all data is present
    console.log(formData);
    let error = "";
    const fields = ['title', 'startDate', 'endDate', 'description'];

    fields.forEach(field => {
      if (formData[field]) {
        formData[field] = formData[field].trim();
      }

      if (field !== "description" && !formData[field]) {
        document.querySelector(`cal-input[name="${field}"]`).setAttribute("hasError", "true");
        let fieldName = field.includes('Date') ? field.slice(0, -4).concat(" ", "date") : field;
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

    const result = Utils.validateDates(new Date(formData.startDate), new Date(formData.endDate));
    if (!result.valid) {
      Toast.show(result.message, 'error');
      return;
    }

    formData.users = usersArray;

    console.log(formData);

    let encodedFormData = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        // Convert array to JSON string
        const value = Array.isArray(formData[key]) ? JSON.stringify(formData[key]) : formData[key];
        encodedFormData.append(key, value);
      }
    }

    EventAPI.createEvent(encodedFormData);

    document.getElementById('dialog-create-event').hide();
  }


  render() {
    const template = html`
      <main-header></main-header>
      <div class="page-content">
    
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

      </div>

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
              name="startDate" 
              type="datetime-local"
              @input-change=${this.handleInputChange}>
            </cal-input>
            <cal-input 
              label="End" 
              name="endDate" 
              type="datetime-local"
              @input-change=${this.handleInputChange}>
            </cal-input>
          </div>
          
          <cal-input 
            label="Description" 
            name="description" 
            type="text"
            @input-change=${this.handleInputChange}>
          </cal-input>

          <div>
            <div class="input-label">Participants</div>          
            <div id="checkbox-wrapper"></div>
          </div>
        </form>

        <cal-button
          id="create-submit"
          slot="footer"
          addStyle="min-width: 8rem; margin-inline-end: 1rem;"
          .onClick="${() => this.createEventHandler()}" 
          buttonType="primary">
          Save
        </cal-button>

        <cal-button
          slot="footer"
          addStyle="min-width: 8rem;"
          .onClick="${() => this.hideDialog('dialog-create-event')}" 
          buttonType="secondary">
          Cancel
        </cal-button>
      </sl-dialog>
    `
    render(template, App.rootEl)
  }
}


export default new CalendarView()