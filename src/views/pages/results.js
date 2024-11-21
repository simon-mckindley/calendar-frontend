import App from '../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from '../../Router'
import Utils from '../../Utils'
import FamilyAPI from '../../FamilyAPI'
import AdminHomeView from './admin_home'

const userType = { 1: "Admin", 2: "Adult", 3: "Child" };

class ResultsView {
  init() {
    document.title = 'Results'
    this.render();
    Utils.pageIntroAnim();
    this.results = AdminHomeView.searchResults;
    console.log(this.results);
    this.render();
    this.selectFirstData();
  }

  selectFirstData() {
    if (!this.results) return;

    if (this.results.searchType === "user") {
      this.populateUserData(this.results.users[0]);
    } else if (this.results.searchType === "family") {
      this.populateFamilyData(this.results.familys[0]);
    } else if (this.results.searchType === "event") {
      this.populateEventData(this.results.events[0]);
    }
  }


  async populateUserData(userData) {
    console.log(userData);
    // Find the data-display-wrapper element
    const wrapper = document.querySelector('.data-display-wrapper');
    if (!wrapper) return;

    // Populate the title
    const titleElement = wrapper.querySelector('.head .title');
    titleElement.textContent = `${Utils.titleCase(userData.firstName)} ${Utils.titleCase(userData.lastName)}`;

    // Populate the date
    const dateElement = wrapper.querySelector('.head .date');
    dateElement.textContent = `Joined ${Utils.formatDateAU(userData.createdAt)}`;

    let familyData = null;
    if (userData.family) {
      familyData = await FamilyAPI.getFamily(userData.family);
    }
    console.log(familyData);

    // Populate the data body
    const bodyElement = wrapper.querySelector('.data-body');
    bodyElement.innerHTML = "";

    // Email
    const emailElement = document.createElement('div');
    emailElement.textContent = userData.email;
    emailElement.style = "font-size: 1.2em; font-weight: bold;";

    // User type
    const typeElement = document.createElement('div');
    typeElement.textContent = "User Type: ";
    const typeSpan = document.createElement('span');
    typeSpan.textContent = userType[userData.accessLevel];
    typeElement.append(typeSpan);

    // Family
    const familyElement = document.createElement('div');
    familyElement.textContent = "Family: ";
    const familySpan = document.createElement('span');
    familySpan.textContent = familyData ? Utils.titleCase(familyData.name) : "None";
    familyElement.append(familySpan);

    // Events
    const eventElement = document.createElement('div');
    eventElement.textContent = "Events: ";
    const eventSpan = document.createElement('span');
    eventSpan.textContent = (userData.events.length > 0)
      ? `(${userData.events.length})` : "None";
    eventElement.append(eventSpan);

    bodyElement.append(emailElement, typeElement, familyElement, eventElement);
  }


  async populateFamilyData(familyData) {
    console.log(familyData);
    // Find the data-display-wrapper element
    const wrapper = document.querySelector('.data-display-wrapper');
    if (!wrapper) return;

    // Populate the title
    const titleElement = wrapper.querySelector('.head .title');
    titleElement.textContent = Utils.titleCase(familyData.name);

    // Populate the date
    const dateElement = wrapper.querySelector('.head .date');
    dateElement.textContent = `Created ${Utils.formatDateAU(familyData.createdAt)}`;

    // Populate the data body
    const bodyElement = wrapper.querySelector('.data-body');
    bodyElement.innerHTML = "";

    // Members
    const usersElement = document.createElement('div');
    usersElement.className = "family-members";
    usersElement.textContent = "Members: ";

    if (familyData.users.length > 0) {
      familyData.users.forEach(user => {
        const userSpan = document.createElement('div');
        userSpan.textContent = `${Utils.titleCase(user.firstName)} ${Utils.titleCase(user.lastName)}`;
        usersElement.append(userSpan);
      });
    } else {
      const userSpan = document.createElement('span');
      userSpan.textContent = "None";
      usersElement.append(userSpan);
    }

    bodyElement.append(usersElement);
  }


  async populateEventData(eventData) {
    console.log(eventData);
    // Find the data-display-wrapper element
    const wrapper = document.querySelector('.data-display-wrapper');
    if (!wrapper) return;

    // Populate the title
    const titleElement = wrapper.querySelector('.head .title');
    titleElement.textContent = Utils.titleCase(eventData.title);

    // Populate the date
    const dateElement = wrapper.querySelector('.head .date');
    dateElement.textContent = Utils.formatDateTimeAU(eventData.start);

    // Populate the data body
    const bodyElement = wrapper.querySelector('.data-body');
    bodyElement.innerHTML = "";

    // All day
    const alldayElement = document.createElement('div');
    alldayElement.textContent = "All Day ";
    const alldaySpan = document.createElement('span');
    alldaySpan.innerHTML = eventData.allDay
      ? '<i class="fa-regular fa-circle-check" style="color: green;"></i>'
      : '<i class="fa-regular fa-circle-xmark" style="color: red;"></i>';
    alldayElement.append(alldaySpan);

    // Description
    const descriptionElement = document.createElement('div');
    descriptionElement.textContent = "Description: ";
    const descriptionSpan = document.createElement('div');
    descriptionSpan.style = "font-weight: bold;";
    descriptionSpan.innerHTML = eventData.description
      ? Utils.formatTextWithLineBreaks(eventData.description)
      : "None";
    descriptionElement.append(descriptionSpan);

    // Members
    const usersElement = document.createElement('div');
    usersElement.className = "family-members";
    usersElement.textContent = "Participants: ";

    if (eventData.users.length > 0) {
      eventData.users.forEach(user => {
        const userSpan = document.createElement('div');
        userSpan.textContent = `${Utils.titleCase(user.firstName)} ${Utils.titleCase(user.lastName)}`;
        usersElement.append(userSpan);
      });
    } else {
      const userSpan = document.createElement('span');
      userSpan.textContent = "None";
      usersElement.append(userSpan);
    }

    bodyElement.append(alldayElement, alldayElement, descriptionElement, usersElement);
  }


  render() {
    const template = html`
      <main-header></main-header>
      
      <div class="page-content page-centered">
      ${(!this.results)
        ? html`<main-spinner></main-spinner>`
        : html`
          <div class="results-wrapper">
            <div class="display-box">
              <h2 class="results-title scroll-box-title">
                ${Utils.titleCase(this.results.searchType)} Search Results
              </h2>
              <div class="data-scroll-box">

              ${this.results.users
            ? this.results.users
              .map(user => html`
                <user-tile 
                  .user="${user}"
                  .onClick="${() => this.populateUserData(user)}" >
                </user-tile>
              `)
            : html``
          }

               ${this.results.familys
            ? this.results.familys
              .map(item => html`
                <data-tile
                  label=${Utils.titleCase(item.name)} 
                  date=${Utils.formatDateTimeAU(item.createdAt)} 
                  icon="family.svg"
                  .onClick=${() => this.populateFamilyData(item)}>
                </data-tile>
              `)
            : html``
          }

              ${this.results.events
            ? this.results.events
              .sort((a, b) => new Date(b.start) - new Date(a.start)) // Sort by start time descending
              .map(item => html`
                <data-tile 
                  label=${Utils.titleCase(item.title)} 
                  date=${Utils.formatDateTimeAU(item.start)} 
                  .onClick=${() => this.populateEventData(item)}>
                </data-tile>
              `)
            : html``
          }
            </div >
          </div >

          <div class="data-display-wrapper">
            <div class="head">
              <div class="title"></div>
              <div class="date"></div>
            </div>

            <div class="data-body"></div>

            <div class="foot">
              <cal-button
                buttonType="primary"
                addStyle="width: 80%; margin-bottom: 1rem"
                .onClick=${() => gotoRoute('/results')}
              >Edit</cal-button>
            </div>
          </div >

        </div >
      `}
      </div>`

    render(template, App.rootEl)
  }
}


export default new ResultsView()