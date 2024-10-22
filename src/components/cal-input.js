import { LitElement, html, css } from 'lit-element';

class CalInput extends LitElement {
    static get properties() {
        return {
            type: { type: String },  // Type of the input (text, password, email, etc.)
            label: { type: String },      // Label for the input
            name: { type: String },       // Name for the input
            placeholder: { type: String }, // Input placeholder text
            value: { type: String }       // Value of the input (for returning form data)
        };
    }

    static get styles() {
        return css`
      .cal-input-wrapper {
        margin-bottom: 1em;
      }

      .cal-input-wrapper label {
        font-size: 1em;
        font-family: "Maven-SemiBold";
        margin-left: 1em;
        margin-bottom: 2px;
        display: block;
      }

      .cal-input-wrapper input {
        padding: 0.5em 1em;
        font: inherit;
        border: none;
        border-radius: 1000px;
        width: calc(100% - 2em);
        box-shadow: 2px 2px 5px 1px var(--shadow-color);
      }

      .cal-input-wrapper input[type="search"]{
        width: 100%;
      }

      .cal-input-wrapper input:focus-visible {
        outline: 2px solid var(--secondary-color);
        outline-offset: -2px;
      }
    `;
    }

    constructor() {
        super();
        this.type = 'text';  // Default input type
        this.label = '';          // Default label
        this.name = 'cal-input';    // Default name
        this.placeholder = '';    // Deflault placeholder
        this.value = '';          // Default value
    }

    handleInputChange(e) {
        // Update the value when the user types in the input field
        this.value = e.target.value;
        // Emit a custom event so parent forms can catch the value
        this.dispatchEvent(new CustomEvent('input-change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
      <div class="cal-input-wrapper">
        <label for="id_${this.name.replace(' ', '_')}">
          ${this.label}
        </label>
        <input
          id="id_${this.name.replace(' ', '_')}"
          name="${this.name.replace(' ', '_')}"
          type="${this.type}"
          placeholder="${this.placeholder}"
          maxlength="100"
          .value="${this.value}"
          @input="${this.handleInputChange}"
        />
      </div>
    `;
    }
}

// Define the custom element
customElements.define('cal-input', CalInput);
