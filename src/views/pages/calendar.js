import App from '../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import Toast from '../../Toast'
import FamilyAPI from '../../FamilyAPI'
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
        this.render();
        this.createUserCheckboxes();
      }
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

    // Sort users alphabetically by firstName
    const sortedUsers = [...this.familyData.users].sort((a, b) =>
      a.firstName.localeCompare(b.firstName)
    );

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



  displayEvent() {
    this.displayUser = displayUser;
    const dialog = document.getElementById('dialog-show-member');

    const today = new Date();
    let nextEvent = null;

    if (displayUser.events) {
      displayUser.events.forEach((evnt) => {
        const eventStartDate = new Date(evnt.startDate); // Ensure startDate is a Date object

        if (eventStartDate > today && (!nextEvent || eventStartDate < new Date(nextEvent.startDate))) {
          nextEvent = evnt;
        }
      });
    }

    document.getElementById("show-next-event").innerText = nextEvent
      ? `Next Event: ${nextEvent}` : "No upcoming events";

    document.getElementById("display-avatar").image = displayUser.avatar
      ? `${App.apiBase}/images/${Auth.currentUser.avatar}` : '';


    dialog.setAttribute("label", `${Utils.titleCase(displayUser.firstName)} ${Utils.titleCase(displayUser.lastName)}`);

    dialog.show();
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
      
      <sl-dialog label="Create event" id="dialog-create-event" style="--width: fit-content;">
        <form class="create-event-form">
          <cal-input label="Event Title" name="title" type="text"></cal-input>
          
          <div class="date-inputs">
            <cal-input label="Start" name="startDate" type="datetime-local"></cal-input>
            <cal-input label="End" name="endDate" type="datetime-local"></cal-input>
          </div>
          
          <cal-input label="Description" name="description" type="text"></cal-input>

          ${this.familyData
        ? html`
          <div>
            <div class="input-label">Participants</div>          
            <div id="checkbox-wrapper"></div>
          </div>`
        : html``
      }
        </form>

        <cal-button
          id="create-submit"
          slot="footer"
          addStyle="min-width: 8rem; margin-inline-end: 1rem;"
          .onClick="${() => this.hideDialog('dialog-create-event')}" 
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