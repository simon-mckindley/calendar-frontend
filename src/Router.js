import Auth from './Auth.js'

// import views
import homeView from './views/pages/user_home'
import adminHomeView from './views/pages/admin_home'
import resultsView from './views/pages/results'
import fourOFourView from './views/pages/404'
import loginView from './views/pages/login'
import registerView from './views/pages/register'
import accountView from './views/pages/account'
import editProfileView from './views/pages/editProfile'
import familyView from './views/pages/family'
import calendarView from './views/pages/calendar'
import guideView from './views/pages/guide'

// define routes
const routes = {
	'/': homeView,
	'/admin': adminHomeView,
	'/results': resultsView,
	'404': fourOFourView,
	'/login': loginView,
	'/register': registerView,
	'/guide': guideView,
	'/account': accountView,
	'/editProfile': editProfileView,
	'/family': familyView,
	'/calendar': calendarView
}

class Router {
	constructor() {
		this.routes = routes
	}

	init() {
		// initial call
		this.route(window.location.pathname)

		// on back/forward
		window.addEventListener('popstate', () => {
			this.route(window.location.pathname)
		})
	}

	route(fullPathname) {
		// extract path without params
		const pathname = fullPathname.split('?')[0]
		const route = this.routes[pathname]

		if (route) {
			// if route exists, run init() of the view
			this.routes[window.location.pathname].init()
		} else {
			// show 404 view instead
			this.routes['404'].init()
		}
	}

	gotoRoute(pathname) {
		window.history.pushState({}, pathname, window.location.origin + pathname);
		this.route(pathname)
	}
}

// create appRouter instance and export
const AppRouter = new Router()
export default AppRouter


// programmatically load any route
export function gotoRoute(pathname) {
	if (Auth.currentUser && Auth.currentUser.accessLevel === 1 && pathname === '/') {
		pathname = '/admin'
	}
	AppRouter.gotoRoute(pathname)
}


// allows anchor <a> links to load routes
export function anchorRoute(e) {
	e.preventDefault()
	let pathname = e.target.closest('a').pathname
	if (Auth.currentUser && Auth.currentUser.accessLevel === 1 && pathname === '/') {
		pathname = '/admin'
	}
	AppRouter.gotoRoute(pathname)
}
