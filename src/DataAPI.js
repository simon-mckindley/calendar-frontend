import App from './App'
import Auth from './Auth'
import Toast from './Toast'

class DataAPI {

  async updateUser(userId, userData) {
    // validate
    if (!userId || !userData) return

    // make fetch request to backend
    const response = await fetch(`${App.apiBase}/user/${userId}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${localStorage.accessToken}` },
      body: userData
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json()
      if (err) console.log(err)
      // throw error (exit this function)      
      throw new Error('Problem updating user')
    }

    // convert response payload into json - store as data
    const data = await response.json()

    // return data
    return data
  }

  async getFamily(familyId) {
    // validate
    if (!familyId) return

    // fetch the json data
    const response = await fetch(`${App.apiBase}/family/${familyId}`, {
      headers: { "Authorization": `Bearer ${localStorage.accessToken}` }
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json()
      if (err) console.log(err)
      // throw error (exit this function)      
      throw new Error('Problem getting family')
    }

    // convert response payload into json - store as data
    const data = await response.json()

    // return data
    return data
  }
}

export default new DataAPI()