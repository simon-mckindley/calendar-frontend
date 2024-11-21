import { LitElement, html, css } from 'lit-element'
import Utils from '../Utils'

// Tile for showing family invitations
class InviteTile extends LitElement {
  static get properties() {
    return {
      family: { type: Object },
      acceptOnClick: { type: Function },  // Click event handler
      declineOnClick: { type: Function }
    };
  }

  static get styles() {
    return css`
      .invitation-wrapper {
        background-color: white;
        border-radius: 10px;
        margin-block-start: 2rem;
        padding: 0.5rem;
        box-shadow: 1px 1px 2px 1px var(--shadow-color);
      }

      .invitation-text {
        font-size: 1.2em;
      }

      .invitation-text span {
        font-weight: bold;
      }

      .invitation-buttons {
        display: flex;
        column-gap: 1rem;
        justify-content: end;
        margin-block-start: 0.5rem;
      }
    `;
  }

  constructor() {
    super();
    this.family = {};
    this.acceptOnClick = () => { };  // Click event handler
    this.declineOnClick = () => { };
  }

  render() {
    return html`
      <div class="invitation-wrapper">
        <div class="invitation-text">
          You have been invited to the
          <span> ${Utils.titleCase(this.family.name)} </span>
          family
        </div>

        <div class="invitation-buttons">
          <sl-tooltip content="Decline invitation">
            <cal-button
              id="invite-decline"
              @click="${this.declineOnClick}"
              addStyle="padding-inline: 0.7em;"
              buttonType="secondary">
              <i class="fa-solid fa-xmark"></i>
            </cal-button>
          <sl-tooltip>

          <sl-tooltip content="Accept invitation">
            <cal-button
              id="invite-accept"
              @click="${this.acceptOnClick}"
              addStyle="padding-inline: 0.7em;"
              buttonType="primary">
              <i class="fa-solid fa-check"></i>
            </cal-button>
          </sl-tooltip>
        </div>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('invite-tile', InviteTile);
