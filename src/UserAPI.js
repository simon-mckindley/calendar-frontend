import App from './App'
import Auth from './Auth'
import Toast from './Toast'

class UserAPI {

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


  async getUser(userId) {
    // validate
    if (!userId) return

    // fetch the json data
    const response = await fetch(`${App.apiBase}/user/${userId}`, {
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` }
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json()
      if (err) console.log(err)
      // throw error (exit this function)      
      throw new Error('Problem getting user')
    }

    // convert response payload into json - store as data
    const data = await response.json()

    // return data
    return data
  }


  async removeInvitation(userId, familyId) {
    // validate
    if (!userId || !familyId) return

    const response = await fetch(`${App.apiBase}/user/${userId}/removeInvitation/${familyId}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` }
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json();
      if (err) console.log(err);
      Toast.show('Problem removing invitation', 'err');
      throw new Error('Problem removing invitation')
    }

    // convert response payload into json - store as data
    const data = await response.json();
    Toast.show('Family invitation removed');
    // return data
    return data
  }
}

export default new UserAPI()