import Router from './Router'
import Auth from './Auth'
import Toast from './Toast'


class App {
  constructor() {
    this.name = "ClanCalendar"
    this.version = "1.0.0"
    // this.apiBase = 'http://localhost:3000'
    this.apiBase = 'https://smck-calendar-backend-e2c67e518cad.herokuapp.com'
    this.rootEl = document.getElementById("root")
    this.version = "1.0.0"
  }

  init() {
    console.log("App.init")

    // Toast init
    Toast.init()

    // Authentication check    
    Auth.check(() => {
      // authenticated! init Router
      Router.init()
    })
  }
}

export default new App()