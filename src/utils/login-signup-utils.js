import axios from 'axios'
import {getCookie} from './api-utlis.js'
export async function tryLogin(username, password){
    try{
        const csrfToken = await getCookie();
        const body = {'username':username,'password':password};
        const request = await axios.post('http://127.0.0.1:8000/login/',
                                         body,
                                         {headers:{
                                             'X-CSRFToken':csrfToken
                                             },
                                             withCredentials:true
                                         });
        const response = request.data;
        alert(JSON.stringify(response));
    }catch (error){
        alert(`Eroarea pulii ${error}`)
        return {response:'Could not receive back answer'};
    }
}
export async function signUp(){
    return null;
}
