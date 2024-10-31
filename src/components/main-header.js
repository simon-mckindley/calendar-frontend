import { LitElement, html, css } from 'lit-element'
import { anchorRoute, gotoRoute } from '../Router'
import Auth from '../Auth'
import App from '../App'

customElements.define('main-header', class AppHeader extends LitElement {
  constructor() {
    super()
    this.navBtn = null;
    this.avatar = null;
    this.menu = null;
    // Bind the method to the component instance
    this.handleGlobalClick = this.handleGlobalClick.bind(this);
  }

  createRenderRoot() {
    return this; // This makes the component render in the light DOM
  }

  firstUpdated() {
    super.firstUpdated()
    this.navActiveLinks()
    this.navBtn = this.querySelector(".nav-button");
    this.avatar = this.querySelector("sl-avatar");
    this.menu = this.querySelector(".nav-dropdown-menu");
  }

  navActiveLinks() {
    let currentPath = window.location.pathname.slice(1).toLowerCase();
    if (currentPath === "") currentPath = "home";
    const navLinks = this.querySelectorAll('.nav-link');
    navLinks.forEach(navLink => {
      if (navLink.id.split("-")[0].toLowerCase() === currentPath) {
        navLink.setAttribute("disabled", "true");
      }
    })
  }

  connectedCallback() {
    super.connectedCallback();
    // Add the global click event listener when the component is added to the DOM
    window.addEventListener('click', this.handleGlobalClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Remove the event listener when the component is removed from the DOM
    window.removeEventListener('click', this.handleGlobalClick);
  }

  handleGlobalClick(event) {
    if (!Auth.currentUser) return;

    if (event.target !== this.navBtn && event.target !== this.menu && event.target !== this.avatar) {
      this.menu.classList.remove("show-menu");
    }
  }

  showMenu() {
    this.menu.classList.toggle("show-menu");
  }

  render() {
    return html`
    <style>
      .app-header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--app-header-txt-color);
        background: var(--app-header-bg-color);
        height: var(--app-header-height);
        padding-inline: 2vw;
        box-shadow: 2px 0px 4px 0px var(--shadow-color);
      }

      .center-title {
        justify-content: center;
      }
      
      .app-title {
        font-family: "Lemon-Regular", serif;
        margin: 0;
        font-size: var(--app-header-title-font-size);
      }

      .top-nav button {
        display: flex;
        align-items: center;
        gap: 0.5em;
        font: inherit;
        background-color: transparent;
        border: none;
        cursor: pointer;
      }

      .user-title {
        display: flex;
        flex-direction: column;
      }

      .user-title .header-username {
        font-size: 1.2em;
      }

      .nav-dropdown-menu {
        position: absolute;
        top: 90%;
        right: -12em;
        display: flex;
        flex-direction: column;
        gap: 0.75em;
        align-items: start;
        font-family: "Maven-Medium";
        background-color: #fff;
        padding: 1em 1.5em;
        border: 1px solid var(--secondary-color);
        border-radius: 5px;
        box-shadow: 2px 2px 4px 0px var(--shadow-color);
        z-index: 1000;
        transition: right 500ms
      }

      .show-menu {
        right: 2vw;
        /* animation: show-menu 500ms ease forwards; */
      }
      
      @keyframes show-menu {
        100% {
          right: 2vw;
        }
      }

      .nav-link:not(:disabled):hover {
        text-decoration: underline;
      }

      /* active nav link */
      .nav-link:disabled {
        color: var(--primary-color);
        cursor: default;
      }

      /* RESPONSIVE - MOBILE ------------------- */
      @media all and (max-width: 768px){       
        .top-nav {
          display: none;
        }
      }

    </style>

    <header class="app-header ${Auth.currentUser ? "" : "center-title"}">      
      <span class="app-title">ClanCalendar</span>

      ${Auth.currentUser ? html`
        <nav class="top-nav">
          <button type="button" class="nav-button" @click="${() => this.showMenu()}">
            <div class="user-title">
              <span class="header-username">${Auth.currentUser && Auth.currentUser.firstName}</span>
              <span>${Auth.currentUser.accessLevel === 1 ? "Admin " : ""}</span>
            </div>
            <sl-avatar style="--size: 32px;" image=${(Auth.currentUser && Auth.currentUser.avatar) ?
          `${App.apiBase}/images/${Auth.currentUser.avatar}` : ''}></sl-avatar> 
          </button>
          <div class="nav-dropdown-menu"> 
              <button type="button" id="home-link" class="nav-link" @click="${() => gotoRoute('/')}">Home</button>          
              <button type="button" id="profile-link" class="nav-link" @click="${() => gotoRoute('/profile')}">Profile</button>
              <button type="button" id="editprofile-link" class="nav-link" @click="${() => gotoRoute('/editProfile')}">Edit Profile</button>
              <button type="button" id="calendar-link" class="nav-link" @click="${() => gotoRoute('/calendar')}">Calendar</button>
              <button type="button" class="nav-link" @click="${() => Auth.signOut()}">Sign Out</button>
          </div>
        </nav>
      ` :
        html``
      }
    </header>
    `
  }

})

