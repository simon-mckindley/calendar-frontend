import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Utils from './../../Utils'
import UserAPI from '../../UserAPI'
import FamilyAPI from '../../FamilyAPI'
import EventAPI from '../../EventAPI'
import Toast from '../../Toast'

let formData;

// Home page for the admin type user
class AdminHomeView {
  constructor() {
    this.searchResults = null
  }

  init() {
    console.log('AdminHomeView.init')
    document.title = 'Home'
    formData = {};
    this.render()
    Utils.pageIntroAnim()
  }

  // Handle input changes
  handleInputChange(event) {
    event.target.removeAttribute("hasError");
    const { name, value } = event.detail;
    formData[name] = value;  // Dynamically update form data
  }

  // Handles the search submit
  async searchSubmitHandler(searchType = true, button) {
    // Checks if all data is present
    if (formData.q) {
      formData.q = formData.q.trim();
    }

    if (!formData.q) {
      document.querySelector('cal-search').setAttribute("hasError", "true");
      Toast.show('Please enter a search query', 'error');
      return;
    }

    let buttonText = "<sl-spinner></sl-spinner>"
    button.innerHTML = buttonText;

    try {
      // Calls Api based on search type
      if (searchType === "user") {
        this.searchResults = await UserAPI.userSearch(formData.q);
        buttonText = "Search Users";
      } else if (searchType === "family") {
        this.searchResults = await FamilyAPI.searchFamily(formData.q);
        buttonText = "Search Families";
      } else if (searchType === "event") {
        this.searchResults = await EventAPI.searchEvent(formData.q);
        buttonText = "Search Events";
      }

      this.searchResults.searchType = searchType;

      // Go to results page if search is successful
      this.searchResults.num === 0
        ? Toast.show('No results for this query', 'error')
        : gotoRoute('/results');

    } catch (error) {
      console.log(error);
    }

    button.textContent = buttonText
  }

  
  render() {
    const template = html`
        <main-header></main-header>
      
        <div class="page-content page-centered">
          <div class="adminhome-wrapper">
            <h1>Data Search</h1>
            <cal-search 
              placeholder="Filter" 
              searchIcon="./images/search_icon_24.svg"
              @input-change=${this.handleInputChange}>
            </cal-search>

            <cal-button
              buttonType="secondary"
              addStyle="width: 100%"
              .onClick=${(e) => this.searchSubmitHandler("user", e.target)}
            >Search Users</cal-button>

            <cal-button
              buttonType="secondary"
              addStyle="width: 100%;"
              .onClick=${(e) => this.searchSubmitHandler("family", e.target)}
            >Search Families</cal-button>

            <cal-button
              buttonType="secondary"
              addStyle="width: 100%;"
              .onClick=${(e) => this.searchSubmitHandler("event", e.target)}
            >Search Events</cal-button>
          </div>
        </div>
      `
    render(template, App.rootEl)
  }
}

export default new AdminHomeView()