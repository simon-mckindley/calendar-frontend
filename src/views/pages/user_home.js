import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'

class UserHomeView {
  init() {
    console.log('UserHomeView.init')
    this.items = [{ title: 'Event 1', date: 'October 14, 2024' }, { title: 'Event 2', date: 'October 16, 2024' }, { title: 'Event 3', date: 'October 29, 2024' }, { title: 'Event 1', date: 'October 14, 2024' }, { title: 'Event 2', date: 'October 16, 2024' }, { title: 'Event 3', date: 'October 29, 2024' }, { title: 'Event 1', date: 'October 14, 2024' }, { title: 'Event 2', date: 'October 16, 2024' }, { title: 'Event 3', date: 'October 29, 2024' }]; // test events
    this.items = []
    document.title = 'Home'
    this.render()
    Utils.pageIntroAnim()
  }

  render() {
    const template = html`
        <main-header></main-header>
      
        <div class="page-content page-centered">
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

              <cal-button
                buttonType="secondary"
                addStyle="width: 100%;"
                .onClick=${() => gotoRoute('/family')}
              >Family</cal-button>
            </div>

            <h2 class="events-title scroll-box-title">Upcoming Events</h2>
            <div class="events-wrapper data-scroll-box">
            ${this.items && this.items.length > 0
              ? this.items.map(item => html`
              <data-tile 
                label=${item.title} 
                date=${item.date} 
                .onClick=${() => alert('Tile clicked!')}>
              </data-tile>`) : 
              html`
              <div>No current events</div>`
            }
            </div>

          </div>
        </div>
      `
    render(template, App.rootEl)
  }
}

export default new UserHomeView()