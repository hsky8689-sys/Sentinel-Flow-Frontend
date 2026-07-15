import axios from 'axios'
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
export async function tryLogin(username, password){
    try{
        await requestCsrfToken();
        const loginData = {'username':username,'password':password};
        const response = axios.post('http://127.0.0.1:8000/login/',loginData);
        const data = JSON.stringify(response.data);
        if(data.status === 403){
            
        }
        alert(data);
    }catch (error) {
        alert(`Eroarea pulii ${error}`)
        return {response:'Could not receive back answer'};
    }
}
async function requestCsrfToken(){
    try {
        await axios.get('http://127.0.0.1:8000/users/api/csrf-token')
        console.log('CSRF token succsesfully retrieved');
    }catch (error) {
        console.log(`Unexpected error ${error} occurred while retrieving the csrf token`)
    }
}
export async function signUp(){
    return null;
}
