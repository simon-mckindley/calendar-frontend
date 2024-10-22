import App from '../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import { Calendar } from 'fullcalendar'

const title = 'Calendar'

class TemplateView {

  init() {
    document.title = title
    this.render()
    this.showCalendar()
    Utils.pageIntroAnim()
  }

  showCalendar() {
    // Wait for the DOM to update before querying the element
    setTimeout(() => {
      const calendarEl = document.getElementById('calendar')
      console.log("EL", calendarEl);
      if (calendarEl) {
        const calendar = new Calendar(calendarEl, {
          initialView: 'dayGridMonth',  // 'dayGridWeek', 'timeGridDay', 'listWeek'
          headerToolbar: {
            start: 'prev today', // will normally be on the left. if RTL, will be on the right
            center: 'title',
            end: 'timeGridDay dayGridWeek dayGridMonth next' // will normally be on the right. if RTL, will be on the left
          }
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

  render() {
    const template = html`
      <main-header title="${title}" user="${JSON.stringify(Auth.currentUser)}"></main-header>
      <div class="page-content">        
        <h1>${title}</h1>
        
        <div id='calendar' style="padding: 2rem 4rem; "></div>

      </div>      
    `
    render(template, App.rootEl)
  }
}


export default new TemplateView()