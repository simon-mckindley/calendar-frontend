import App from '../../App'
import { html, render } from 'lit'
import { anchorRoute, gotoRoute } from '../../Router'
import Auth from '../../Auth'
import Utils from '../../Utils'

class LoginView {
  init() {
    document.title = 'Login'
    this.render()
    Utils.pageIntroAnim()
  }

  signInSubmitHandler(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());

    console.log('SUBMIT HANDLER', formValues);
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.setAttribute('loading', '');

    // sign in using Auth    
    Auth.signIn(formData, () => {
      submitBtn.removeAttribute('loading')
    })
  }

  render() {
    const template = html`  
      <main-header></main-header>

      <div class="page-content page-centered">
        <div class="login-wrapper">
          <img class="login-logo" src="/images/calendar_image.png">      
              
          <form class="form-login" @submit=${this.signInSubmitHandler}>
            <cal-input label="Email" name="email" type="email"></cal-input>
            <cal-input label="Password" name="password" type="password" 
              style="margin-block-start: 0.5em"></cal-input>

            <cal-button 
              submit=true 
              buttonType="primary"
              style="width: 100%; margin-block-start: 1em" 
            >Login</cal-button>

            <cal-button 
              buttonType="secondary" 
              style="width: 100%; margin-block-start: 0.5em" 
              .click=${() => gotoRoute('/signup')}>
              Register
            </cal-button>
          </form>
        </div>
      </div>
    `
    render(template, App.rootEl)
  }
}

export default new LoginView()