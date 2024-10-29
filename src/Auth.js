import App from './App'
import Router, { gotoRoute } from './Router'
import splash from './views/partials/splash'
import { html, render } from 'lit'
import Toast from './Toast'
import Utils from './Utils'

class Auth {

  constructor() {
    this.currentUser = null
  }

  async signUp(userData, fail = false) {
    const response = await fetch(`${App.apiBase}/user`, {
      method: 'POST',
      body: userData
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json()
      if (err) console.log(err)
      // show error      
      Toast.show(`Problem getting user: ${response.status}`)
      // run fail() functon if set
      if (typeof fail == 'function') fail();

      return;
    }
    /// sign up success - show toast and redirect to sign in page
    Toast.show('Account created, please sign in')
    // redirect to signin
    gotoRoute('/login')
  }


  async signIn(userData, fail = false) {
    const response = await fetch(`${App.apiBase}/auth/signin`, {
      method: 'POST',
      body: userData
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json()
      if (err) console.log(err)
      // show error      
      Toast.show(`Problem signing in: ${err.message}`, 'error')
      // run fail() functon if set
      if (typeof fail == 'function') fail()

      return;
    }

    // sign in success
    const data = await response.json()
    data.user.firstName = Utils.titleCase(data.user.firstName);
    data.user.lastName = Utils.titleCase(data.user.lastName);
    Toast.show(`Welcome  ${data.user.firstName}`)
    // save access token (jwt) to local storage
    localStorage.setItem('cal_accessToken', data.token)
    // set current user
    this.currentUser = data.user
    console.log(this.currentUser);
    // redirect to home
    Router.init()
    gotoRoute('/')
  }


  async check(success) {
    // show splash screen while loading ...   
    render(splash, App.rootEl)

    // check local token is there
    if (!localStorage.cal_accessToken) {
      // no local token!
      Toast.show("Please sign in")
      // redirect to sign in page      
      gotoRoute('/login')
      return
    }

    // token must exist - validate token via the backend
    const response = await fetch(`${App.apiBase}/auth/validate`, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${localStorage.cal_accessToken}`
      }
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json()
      if (err) console.log(err)
      // delete local token
      localStorage.removeItem('cal_accessToken')
      Toast.show("Session expired, please sign in")
      // redirect to sign in      
      gotoRoute('/login')
      return
    }

    // token is valid!
    const data = await response.json();
    data.user.firstName = Utils.titleCase(data.user.firstName);
    data.user.lastName = Utils.titleCase(data.user.lastName);
    // console.log(data)
    // set currentUser obj
    this.currentUser = data.user;
    // run success
    success()
  }

  signOut() {
    Toast.show("You are signed out")
    // delete local token
    localStorage.removeItem('cal_accessToken')
    // redirect to sign in    
    gotoRoute('/login')
    // unset currentUser
    this.currentUser = null
  }
}

export default new Auth()