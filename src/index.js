import App from './App.js'

// styles
import './scss/master.scss'

// shoelace
import '@shoelace-style/shoelace/dist/shoelace.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
setBasePath('@shoelace-style');

// components (custom web components)
import './components/main-header'
import './components/cal-button'
import './components/data-tile'
import './components/cal-input'
import './components/cal-search'
import './components/user-tile'


// app.init
document.addEventListener('DOMContentLoaded', () => {
  App.init()
})