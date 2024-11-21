import { LitElement, html, css } from 'lit-element';

// Search input component based on the primary input component
class CalSearch extends LitElement {
  static get properties() {
    return {
      label: { type: String },      // Label for the input
      placeholder: { type: String }, // Input placeholder text
      hasError: { type: Boolean },  // Indicates if input has error state
      searchIcon: { type: String },    // Search Icon path
      value: { type: String }       // Value of the input (for returning form data)
    };
  }

  static get styles() {
    return css`
      .search-wrapper {
        position: relative;
      }

      .search-icon {
        position: absolute;
        top: 50%;
        right: 0.75em;
        translate: 0 -50%;
      }
    `;
  }

  constructor() {
    super();
    this.label = '';          // Default label
    this.placeholder = '';    // Default placeholder
    this.hasError = false     // Default error state
    this.searchIcon = '';     // Default icon path
    this.value = '';          // Default value
  }

  handleInputChange(e) {
    // Update the value when the user types in the input field
    this.value = e.target.value;
    // Emit a custom event so parent forms can catch the value
    this.dispatchEvent(new CustomEvent('search-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="search-wrapper">
        <cal-input 
          placeholder="${this.placeholder}" 
          name="q" 
          type="text"
          ?hasError=${this.hasError}
        ></cal-input>
        <img 
          class="search-icon" 
          width="24" height="24"
          src="${this.searchIcon}"
        >
      </div>
    `;
  }
}

// Define the custom element
customElements.define('cal-search', CalSearch);
