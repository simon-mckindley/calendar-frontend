import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'

class HomeView {
  init() {
    console.log('HomeView.init')
    document.title = 'Home'
    this.render()
    Utils.pageIntroAnim()
  }

  render() {
    const template = html`
      <main-header></main-header>
      
      <div class="page-content">
        <h1 class="anim-in">Hey ${Auth.currentUser.firstName}</h1>

        <h3>Button example:</h3>
        <sl-button class="anim-in" @click=${() => gotoRoute('/profile')}>View Profile</sl-button>
        <p>&nbsp;</p>
        <sl-icon name="list" label="List"></sl-icon>
        <h3>Link example</h3>
        <a href="/calendar" @click=${anchorRoute}>Calendar</a>
        <div style="color: black; font-size: xx-large;">
          <i class="fa-solid fa-bars"></i>
        </div>
        <cal-button .onClick=${() => alert('Primary Button Clicked')} buttonType="primary" submit=true>
          Primary Button
        </cal-button>

        <div style="height: 10px"></div>

        <cal-button .onClick=${() => alert('Secondary Button Clicked')} buttonType="secondary">
          Secondary Button
        </cal-button>

        <div style="height: 10px"></div>

        <data-tile type="data" label="Event Title" date="October 14, 2024" .onClick=${() => alert('Tile clicked!')}></data-tile>

        <div style="height: 10px"></div>

        <cal-search placeholder="Search" searchIcon="./images/search_icon_24.svg"></cal-search>

<!-- Example usage of the input component inside a form -->
<form>
  <cal-input label="Your Name" name="name" type="text"></cal-input>

  <cal-input label="Your Email" name="email" type="email"></cal-input>

  <cal-input label="Password" name="password" type="password"></cal-input>

  <button type="submit">Submit</button>
</form>
      </div>
    `
    render(template, App.rootEl)
  }
}

export default new HomeView()