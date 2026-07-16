import axios from 'axios'
import {getCookie} from './api-utlis.js'
const BASE_URL = import.meta.env.VITE_API_URL;
const CLIENT_URL = import.meta.env.VITE_BASE_FRONTEND_URL;
export async function tryLogin(username, password){
    try{
        const csrfToken = await getCookie();
        const body = {'username':username,'password':password};
        const request = await axios.post(`${BASE_URL}/login/`,
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
export async function accesProfilePage(userId){

}
export async function signUp(username,email,password,birthday,){
    try{
        const csrfToken = await getCookie();
        const body = {'username':username,
                            'password':password,
                            'email':email,
                            'birthday':birthday
                            };
        const request = await axios.post(`${BASE_URL}/signup/`,
            body,
            {headers:{
                    'X-CSRFToken':csrfToken
                },
                withCredentials:true
            });
        const response = request.data;
        if(response.status === 201) {
            const userId = response.user.id;
            await accesProfilePage(userId);
            return;
        }
        if(response.status === 400) {
            window.location=CLIENT_URL+"/login"
        }
    }catch (error){
        alert(`Error ${error}`);
    }
}
