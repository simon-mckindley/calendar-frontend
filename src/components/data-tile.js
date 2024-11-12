import { LitElement, html, css } from 'lit-element';

class DataTile extends LitElement {
  static get properties() {
    return {
      type: { type: String },     // Tile type
      icon: { type: String },     // Data icon
      label: { type: String },      // Tile title
      date: { type: String },       // Tile date
      onClick: { type: Function }   // Click event handler
    };
  }

  static get styles() {
    return css`
      .data-tile {
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
        
      .data-tile:hover {
        box-shadow: 2px 2px 5px 1px var(--shadow-color);
      }

      .data-tile.active {
        outline: 2px solid var(--secondary-color);
        outline-offset: -2px;
      }

      .tile-title {
        font-size: 1.25em;
      }

      .tile-date {
        display: flex;
        flex-direction: column;
      }
    `;
  }

  constructor() {
    super();
    this.type = 'event';     // Default tile type
    this.icon = 'fa-regular fa-calendar';  // Data icon
    this.label = '';         // Default title
    this.date = '';          // Default date
    this.onClick = () => { }; // Default empty function for onClick
  }

  render() {
    return html`
      <div class="data-tile" @click="${this.onClick}" tabindex="0">
        <div>
      ${this.type === 'event'
        ? html``
        : html``
      }  
          <div class="tile-title">${this.label}</div>
        </div>
        <div class="tile-date">
          ${this.type === 'data'
        ? html`
            <span style="font-size: 0.8em">Created</span>`
        : html``}
          <span>${this.date}</span>
        </div>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('data-tile', DataTile);
