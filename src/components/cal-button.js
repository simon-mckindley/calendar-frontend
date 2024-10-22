import { LitElement, html, css } from 'lit-element'

class CalButton extends LitElement {
  static get properties() {
    return {
      // The button type: primary or secondary
      type: { type: String },
      // The function to call when the button is clicked
      onClick: { type: Function }
    };
  }

  static get styles() {
    return css`
      .cal-btn {
        color: white;
        font-family: "Maven-SemiBold";
        font-size: 1em;
        padding: 0.5em 1.5em;
        /* width: 100%; */
        border-radius: 1000px;
        border: none;
        outline-width: 2px;
        outline-style: solid;
        outline-offset: -2px;
        cursor: pointer;
        box-shadow: 2px 2px 5px 1px var(--shadow-color);
        transition: background-color 300ms ease, color 300ms ease;
      }
      
      .cal-btn:focus-visible {
        outline: 2px solid #000000;
      }

      .cal-btn:active {
        box-shadow: 1px 1px 2px 0px var(--shadow-color);
      }

      /* Primary button style */
      .cal-btn.primary {
        background-color: var(--primary-color);
        outline-color: var(--primary-color);
      }

      .cal-btn.primary:hover {
        color: var(--primary-color);
        background-color: #ffffff;
      }

      /* Secondary button style */
      .cal-btn.secondary {
        background-color: var(--light-secondary-color);
        outline-color: var(--secondary-color);
      }

      .cal-btn.secondary:hover {
        background-color: var(--secondary-color);
      }
    `;
  }

  constructor() {
    super();
    this.type = 'primary'; // Default button type
    this.onClick = () => { }; // Default empty function
  }

  render() {
    return html`
      <button class="cal-btn ${this.type}" @click="${this.onClick}">
        <slot></slot> <!-- Slot for custom button text/content -->
      </button>
    `;
  }
}

// Define the custom element
customElements.define('cal-button', CalButton);
