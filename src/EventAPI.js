import App from './App'
import Toast from './Toast'

class FamilyAPI {

  async createEvent(eventData) {
    if (!eventData) return;

    const response = await fetch(`${App.apiBase}/event`, {
      method: 'POST',
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` },
      body: eventData
    })

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json();
      if (err) console.log(err);
      Toast.show('Problem creating event', 'err');
      // throw error (exit this function)      
      throw new Error('Problem creating event');
    }

    // convert response payload into json - store as data
    const data = await response.json();
    console.log("API ", data)
    Toast.show('Event created');
    // return data
    return data
  }


  async getEvent(eventId) {
    // validate
    if (!eventId) return;

    // fetch the json data
    const response = await fetch(`${App.apiBase}/event/${eventId}`, {
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` }
    });

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json()
      if (err) console.log(err)
      // throw error (exit this function)      
      throw new Error('Problem getting event')
    }

    // convert response payload into json - store as data
    const data = await response.json()

    // return data
    return data
  }


  async updateEvent(eventId, eventData, message = "") {
    if (!eventId && !eventData) return;

    // make fetch request to backend
    const response = await fetch(`${App.apiBase}/event/${eventId}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${localStorage.cal_accessToken}` },
      body: eventData
    });

    // if response not ok
    if (!response.ok) {
      // console log error
      const err = await response.json();
      if (err) console.log(err);
      if(message) Toast.show('Problem updating event', 'err');
      // throw error (exit this function)      
      throw new Error('Problem updating event');
    }

    // convert response payload into json - store as data
    const data = await response.json();
    if(message) Toast.show(message);
    // return data
    return data
  }

}

export default new FamilyAPI()