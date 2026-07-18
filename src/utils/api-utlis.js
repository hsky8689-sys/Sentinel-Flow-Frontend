import axios from 'axios'
const BASE_URL = import.meta.env.VITE_API_URL;
export function searchCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
export async function getCookie() {
    let cookie = searchCookie('csrftoken');
    if (cookie === null) {
        try {
            const response = await axios.get(`${BASE_URL}/users/api/csrf-token`, {
                withCredentials: true
            });
            if (response && response.data) {
                cookie = response.data.csrftoken;
                console.log('Am extras token-ul direct din response.data:', cookie);
            }
        } catch (error) {
            console.log(`Eroare la request-ul de CSRF: ${error}`);
        }
    }
    return cookie;
}