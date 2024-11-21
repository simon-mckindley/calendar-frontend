import { LitElement, html, css } from 'lit-element'
import { anchorRoute, gotoRoute } from '../Router'
import Auth from '../Auth'
import App from '../App'
import Utils from '../Utils'

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
    this.navBtn = this.querySelector(".header-username");
    this.avatar = this.querySelector("sl-avatar");
    this.menu = this.querySelector(".nav-dropdown-menu");
  }

  navActiveLinks() {
    let currentPath = window.location.pathname.slice(1).toLowerCase();
    if (currentPath === "" || currentPath === "admin") currentPath = "home";
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
        z-index: 50;
      }

      .center-title {
        justify-content: center;
      }
      
      .app-title {
        font-family: "Lemon-Regular", serif;
        margin: 0;
        font-size: var(--app-header-title-font-size);
      }

      .nav-wrapper {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .main-nav {
        display: flex;
        gap: 1rem;
        height: var(--app-header-height);
      }
      
      .main-nav .nav-link {
        position: relative;
        font: inherit;
        font-size: 1.2em;
        padding: 0;
        border: none;
        cursor: pointer;
        text-decoration: none;
      }
      
      .main-nav .nav-link div {
        position: relative;
        bottom: -20%;
        width: 100%;
        padding: 0.25rem 0.5rem;
        text-align: center;
        background-color: rgba(255, 255, 255, 0.2);;
        border-radius: 100px;
        box-shadow: 1px 1px 2px 1px var(--shadow-color);
        transition: background-color 300ms, translate 500ms ease;
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
        right: -13em;
        display: flex;
        flex-direction: column;
        gap: 0.75em;
        align-items: center;
        font-family: "Maven-Medium";
        font-size: 1.2em;
        background-color: #fff;
        padding: 1em 2em;
        border: 1px solid var(--secondary-color);
        border-radius: 5px;
        box-shadow: 2px 2px 4px 0px var(--shadow-color);
        z-index: 1000;
        transition: right 500ms
      }

      .nav-img {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 50px;
        rotate: -20deg;
      }

      .show-menu {
        right: 1vw;
      }

      .nav-link:not(:disabled):hover div {
        background-color: var(--secondary-color);
      }

      /* active nav link */
      .nav-link:disabled {
        color: var(--primary-color);
        cursor: default;
      }

      .nav-link:disabled div {
        animation: link-move 500ms ease forwards;
      }
      
      @keyframes link-move {
        100% {
          translate: 0 -40%;
        }
      }

      /* RESPONSIVE - MOBILE ------------------- */
      @media all and (max-width: 800px){   
        .app-title {
          font-size: 1.2rem;
        }    

        .main-nav,
        .user-title {
          display: none;
        }

      }

    </style>

    <header class="app-header ${Auth.currentUser ? "" : "center-title"}">      
      <span class="app-title">ClanCalendar</span>

      ${Auth.currentUser ? html`
      <div class="nav-wrapper">
        <nav class="main-nav">
          <button type="button" id="home-link" class="nav-link" @click="${() => gotoRoute('/')}">
            <div>${(Auth.currentUser.accessLevel === 1) ? "Search" : "Home"}</div>
          </button>  
          ${(Auth.currentUser.accessLevel === 1)
          ? html``
          : html`
          <button type="button" id="calendar-link" class="nav-link" @click="${() => gotoRoute('/calendar')}">
            <div><i class="fa-regular fa-calendar"></i> Calendar</div>
          </button>
          <button type="button" id="family-link" class="nav-link" @click="${() => gotoRoute('/family')}">
            <div><i class="fa-solid fa-people-group"></i> Family</div>
          </button>
          `}
          <button type="button" id="account-link" class="nav-link" @click="${() => gotoRoute('/account')}">
            <div><i class="fa-regular fa-address-card"></i> Account</div>
          </button>
        </nav>

        <nav class="top-nav">
          <button type="button" class="nav-button" @click="${() => this.showMenu()}">
            <div class="user-title">
              <span class="header-username">${Auth.currentUser && Utils.titleCase(Auth.currentUser.firstName)}</span>
              <span>${Auth.currentUser.accessLevel === 1 ? "Admin " : ""}</span>
            </div>
            <sl-avatar style="--size: 32px;" image=${(Auth.currentUser && Auth.currentUser.avatar) ?
          `${App.apiBase}/images/${Auth.currentUser.avatar}` : ''}></sl-avatar> 
          </button>
          <div class="nav-dropdown-menu"> 
              <button type="button" id="home-link" class="nav-link" @click="${() => gotoRoute('/')}">
                ${(Auth.currentUser.accessLevel === 1) ? "Search" : "Home"}
              </button>  
              ${(Auth.currentUser.accessLevel === 1)
          ? html``
          : html`
              <button type="button" id="calendar-link" class="nav-link" @click="${() => gotoRoute('/calendar')}">
                <i class="fa-regular fa-calendar"></i> Calendar
              </button>
              <button type="button" id="family-link" class="nav-link" @click="${() => gotoRoute('/family')}">
                <i class="fa-solid fa-people-group"></i> Family
              </button>  
              `}
              <button type="button" id="account-link" class="nav-link" @click="${() => gotoRoute('/account')}">
                <i class="fa-regular fa-address-card"></i> Account
              </button>
              <button type="button" id="editProfile-link" class="nav-link" @click="${() => gotoRoute('/editProfile')}">
                <i class="fa-solid fa-user-pen"></i> Edit Account
              </button>
              <br>
              <button type="button" class="nav-link" @click="${() => Auth.signOut()}">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
              </button>

              <img class="nav-img" width="10" src="/images/calendar_image_small.png">
          </div>
        </nav>
      </div>`
        : html``
      }
    </header>`
  }

})

