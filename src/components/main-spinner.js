import { LitElement, html, css } from 'lit-element';

// App main spinner
class MainSpinner extends LitElement {
  static get properties() {
    return {
      width: { type: String }
    };
  }

  static get styles() {
    return css`
      .spinner {
          position: relative;
          width: 35px;
          aspect-ratio: 1/1;
          animation: spinner-spin 3000ms linear infinite;
      }

      .spinner .line {
          position: absolute;
          width: 100%;
          height: 6px;
          background-color: var(--primary-color);
          border-radius: 10px;
          transform-origin: left;
          animation: spinner-move 2000ms linear infinite;
      }

      .spinner .top {
          top: 0;
          left: 0;
      }

      .spinner .right {
          rotate: 90deg;
          top: 0;
          left: 100%;
      }

      .spinner .bottom {
          rotate: 180deg;
          top: 100%;
          left: 100%;
      }

      .spinner .left {
          rotate: -90deg;
          top: 100%;
          left: 0;
      }

      @keyframes spinner-move {
          50% {
              width: 10%;
          }
      }

      @keyframes spinner-spin {
          100% {
              rotate: 360deg;
          }
      }
    `;
  }

  constructor() {
    super();
    this.width = "35px";
  }

  render() {
    return html`
      <div class="spinner">
          <div class="line top"></div>
          <div class="line right"></div>
          <div class="line bottom"></div>
          <div class="line left"></div>
      </div>
    `;
  }
}

// Define the custom element
customElements.define('main-spinner', MainSpinner);
