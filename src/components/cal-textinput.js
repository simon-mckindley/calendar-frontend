import { LitElement, html, css } from 'lit-element';

// Textarea input component
class CalTextInput extends LitElement {
  static get properties() {
    return {
      label: { type: String },      // Label for the input
      name: { type: String },       // Name for the input
      hasError: { type: Boolean },  // Indicates if input has error state
      placeholder: { type: String }, // Input placeholder text
      addStyle: { type: String },    // Inline style
      value: { type: String }       // Value of the input (for returning form data)
    };
  }

  static get styles() {
    return css`
      .cal-input-wrapper {
        display: flex;
        flex-direction: column-reverse;
      }

      .cal-input-wrapper label {
        display: block;
        font-size: 1em;
        font-family: "Maven-SemiBold";
        margin-left: 1em;
        margin-bottom: 2px;
        transition: translate 300ms ease;
      }

      .cal-input-wrapper textarea {
        padding: 0.5em 1em;
        font: inherit;
        border: none;
        border-radius: 10px;
        width: calc(100% - 2em);
        box-shadow: 2px 2px 5px 1px var(--shadow-color);
        resize: none;
      }

      .cal-input-wrapper textarea:focus-visible,
      .cal-input-wrapper textarea:focus-within {
        outline: 2px solid var(--secondary-color);
        outline-offset: -2px;
      }

      .cal-input-wrapper textarea:focus-visible+label,
      .cal-input-wrapper textarea:focus-within+label {
        translate: 1em;
      }

      .cal-input-wrapper .error {
        outline: 1px solid var(--primary-color);
      }
    `;
  }

  constructor() {
    super();
    this.label = '';          // Default label
    this.name = this.label;    // Default name
    this.hasError = false     // Default error state
    this.placeholder = '';    // Default placeholder
    this.addStyle = '';          // Default inline style
    this.value = '';          // Default value
  }

  handleInputChange(e) {
    // Update the value when the user types in the input field
    this.value = e.target.value;
    // Emit a custom event so parent forms can catch the value
    this.dispatchEvent(new CustomEvent('input-change', {
      detail: { name: this.name, value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="cal-input-wrapper" style="${this.addStyle}">
        <textarea
          id="id_${this.name.replace(' ', '_')}"
          name="${this.name.replace(' ', '_')}"
          class="${this.hasError ? 'error' : ''}"
          placeholder="${this.placeholder}"
          rows="4"
          .value="${this.value}"
          @input="${this.handleInputChange}"
        ></textarea>
        <label for="id_${this.name.replace(' ', '_')}">
          ${this.label}
        </label>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('cal-textinput', CalTextInput);
