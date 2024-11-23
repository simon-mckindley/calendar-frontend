import App from '../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'
import UserAPI from '../../UserAPI'

class GuideView {
  init() {
    document.title = 'Guide';
    this.render();
    Utils.pageIntroAnim();
    this.updateUser();
  }

  // Sets the users newUser field to false
  async updateUser() {
    let update = new FormData();
    update.append("newUser", false);

    try {
      const data = await UserAPI.updateUser(Auth.currentUser.id, update);
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const template = html`
      <main-header></main-header>

      <div class="page-content">     
        <div class="guide-head"> 
          <div>  
            <h1>Welcome ${Utils.titleCase(Auth.currentUser.firstName)}</h1>
            <h2>Thanks for joining us at <span class="guide-app-name">clanCalendar</span> </h2>
            <p>We're excited to have you here as part of our community. 
              From managing your events and tasks to staying connected with your family, 
              this is your all-in-one hub for keeping organised and on track. 
              Explore the tools available, customise your settings, and take full control 
              of your schedule. Let’s make planning simple and stress-free!
            </p>
          </div>
          <img src="/images/calendar_image_med.png">
        </div>

        <article class="guide-article">
          <div class="guide-text">
            <div>
              <h2>Home Page</h2>
              <p>
                On your home page, you can easily view all your upcoming events 
                at a glance. Stay on top of your schedule with a clear and organised list 
                of what’s ahead, including event details, dates, and times. Whether it’s 
                personal tasks or shared family activities, your home page is designed to 
                keep you informed and prepared for everything on your calendar.
              </p>
            </div>

            <cal-button
              buttonType="secondary"
              addStyle="width: 100%; margin-block-end: 0.5rem;"
              .onClick=${() => gotoRoute('/')}
            >Go to your Home Page</cal-button>
          </div>
          <img src="/images/home_screen.png">
        </article>

        <article class="guide-article">
          <div class="guide-text">
            <div>
              <h2>Calendar</h2>
              <p>
                Easily manage events for yourself and your entire family with the intuitive 
                calendar page. Add, edit, or delete events effortlessly, and keep track of 
                overlapping schedules with a clear visual layout. Whether it’s appointments, 
                reminders, or group activities, the calendar ensures everyone stays in sync 
                and up to date.
              </p>
            </div>

            <cal-button
              buttonType="secondary"
              addStyle="width: 100%; margin-block-end: 0.5rem;"
              .onClick=${() => gotoRoute('/calendar')}
            >Go to your Calendar
            </cal-button>
          </div>
          <img src="/images/calendar_screen.png">
        </article>

        <article class="guide-article">
          <div class="guide-text">
            <div>
              <h2>Family</h2>
              <p>
                View and manage your family group from this page to ensure smooth 
                coordination and communication. Add or remove family members, 
                assign events, and keep track of who’s participating in which activity.
                This page provides all the tools you need to stay connected and organised 
                with your family group.
              </p>
            </div>

            <cal-button
              buttonType="secondary"
              addStyle="width: 100%; margin-block-end: 0.5rem;"
              .onClick=${() => gotoRoute('/family')}
            >Go to your Family Page
            </cal-button>
          </div>
          <img src="/images/family_page.png">
        </article>

        <div class="guide-exit">
          <cal-button
            buttonType="primary"
            .onClick=${() => gotoRoute('/')}
          >Exit Guide</cal-button>
        </div>
        
      </div>      
    `
    render(template, App.rootEl)
  }
}


export default new GuideView()