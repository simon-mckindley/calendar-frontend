import { LitElement, html, css } from 'lit-element';
import Utils from '../Utils';
import App from '../App'

let userTypes = { 1: "Admin", 2: "Adult", 3: "Child" };

class UserTile extends LitElement {
  static get properties() {
    return {
      user: { type: Object },     // User
      onClick: { type: Function }   // Click event handler
    };
  }

  static get styles() {
    return css`
      .user-tile {
        display: flex;
        justify-content: space-between;
        column-gap: 1em;
        align-items: center;
        padding: 1em;
        margin: 0.5em;
        background-color: #fff;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 1px 1px 2px 1px var(--shadow-color);
        transition: box-shadow 0.3s ease;
      }
        
      .user-tile:hover {
        box-shadow: 2px 2px 5px 1px var(--shadow-color);
      }

      .user-tile.active {
        outline: 2px solid var(--secondary-color);
        outline-offset: -2px;
      }

      .tile-user {
        display: flex;
        align-items: center;
        column-gap: 0.5rem;
      }

      .tile-title {
        font-size: 1.25em;
      }

      .tile-data {
        display: flex;
        flex-direction: column;
        align-items: end;
      }
    `;
  }

  constructor() {
    super();
    this.user = {};     // Default user
    this.onClick = () => { }; // Default empty function for onClick
  }

  render() {
    return html`
      <div class="user-tile" @click="${this.onClick}" tabindex="0">
        <div class="tile-user">
          <sl-avatar style="--size: 32px;" image=${(this.user && this.user.avatar) ?
        `${App.apiBase}/images/${this.user.avatar}` : ''}></sl-avatar>
          <div class="tile-title">
            ${Utils.titleCase(this.user.firstName)} ${Utils.titleCase(this.user.lastName)}
          </div>
        </div>
        <div class="tile-data">
          <span style="font-size: 0.8em">Joined ${Utils.formatDateAU(this.user.createdAt)}</span>
          <span>${userTypes[this.user.accessLevel]}</span>
        </div>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('user-tile', UserTile);
