import App from './App'
import Toast from './Toast'

class FamilyAPI {

  async createFamily(familyData) {
    if (!familyData) return;

    const response = await fetch(`${App.apiBase}/family`, {
      method: 'POST',
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` },
      body: familyData
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json();
      if (err) console.log(err);
      Toast.show('Problem creating family', 'err');
      // throw error (exit this function)      
      throw new Error('Problem creating family');
    }

    // convert response payload into json - store as data
    const data = await response.json();
    console.log("API ", data)
    Toast.show('Family created');
    // return data
    return data
  }


  async updateFamily(familyId, familyData) {
    if (!familyId && !familyData) return;

    // make fetch request to backend
    const response = await fetch(`${App.apiBase}/family/${familyId}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` },
      body: familyData
    });

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json();
      if (err) console.log(err);
      Toast.show('Problem updating family', 'err');
      // throw error (exit this function)      
      throw new Error('Problem updating family');
    }

    // convert response payload into json - store as data
    const data = await response.json();
    Toast.show(data.message);
    // return data
    return data
  }


  async getFamily(familyId) {
    // validate
    if (!familyId) return;

    // fetch the json data
    const response = await fetch(`${App.apiBase}/family/${familyId}`, {
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` }
    });

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


  async addUser(familyId, userId) {
    if (!familyId && !userId) return;
    console.log("ADDUSER PATH: " + App.apiBase + " " + familyId + " " + userId);
    // make fetch request to backend
    const response = await fetch(`${App.apiBase}/family/${familyId}/addUser/${userId}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` }
    });

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json();
      if (err) console.log(err);
      Toast.show('Problem adding user', 'err');
      // throw error (exit this function)      
      throw new Error('Problem adding user');
    }

    // convert response payload into json - store as data
    const data = await response.json();
    Toast.show('Associated to family');
    // return data
    return data
  }
}

export default new FamilyAPI()