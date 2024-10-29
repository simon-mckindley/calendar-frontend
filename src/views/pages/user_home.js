import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'

class UserHomeView {
    init() {
        console.log('UserHomeView.init')
        document.title = 'Home'
        this.render()
        Utils.pageIntroAnim()
    }

    render() {
        const template = html`
        <main-header></main-header>
      
        <div class="page-content  page-centered">
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
                .onClick=${() => gotoRoute('/')}
              >Family</cal-button>
            </div>

            <h2 class="events-title">Upcoming Events</h2>

            <div class="events-wrapper">
              <data-tile label="Event Title" date="October 14, 2024" .onClick=${() => alert('Tile clicked!')}></data-tile>
                <!-- todo - get events, display a data-tile for each -->
            </div>

          </div>
        </div>
      `
        render(template, App.rootEl)
    }
}

export default new UserHomeView()