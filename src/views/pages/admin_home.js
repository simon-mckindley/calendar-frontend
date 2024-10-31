import App from './../../App'
import { html, render } from 'lit'
import { gotoRoute, anchorRoute } from './../../Router'
import Auth from './../../Auth'
import Utils from './../../Utils'

class AdminHomeView {
    init() {
        console.log('AdminHomeView.init')
        document.title = 'Home'
        this.render()
        Utils.pageIntroAnim()
    }

    render() {
        const template = html`
        <main-header></main-header>
      
        <div class="page-content page-centered">
          <div class="adminhome-wrapper">
            <cal-search placeholder="Filter" searchIcon="./images/search_icon_24.svg"></cal-search>

            <cal-button
            buttonType="secondary"
            addStyle="width: 100%"
            .onClick=${() => gotoRoute('/')}
            >Search Users</cal-button>

            <cal-button
            buttonType="secondary"
            addStyle="width: 100%;"
            .onClick=${() => gotoRoute('/')}
            >Search Families</cal-button>
          </div>
        </div>
      `
        render(template, App.rootEl)
    }
}

export default new AdminHomeView()