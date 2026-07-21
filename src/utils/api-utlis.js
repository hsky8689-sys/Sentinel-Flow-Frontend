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
export async function accesProfilePage(username){
    try{
        let cookie = searchCookie('csrftoken');
        const response = await axios.get(`${BASE_URL}/users/${username}`,{
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        if (response && response.data) {
            return response.data;
        }
    }catch (error) {
        console.log(`Could not fetch profile data for user ${username}`);
    }
    return;
}
export async function addSkillToSection(sectionId,skillName){
    try{
        let cookie = searchCookie('csrftoken');
        const body = {'section_id':sectionId,'name':skillName};
        const response = await axios.post(`${BASE_URL}/users/skills`,
        body,{
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        const status = response.data.status;
        return status === 200;
    }catch(error){
        console.log(`Could not add skill with name ${skillName} to section with id ${sectionId}`);
    }
    return false;
}
export async function deleteSkill(skillId){
    try{
        let cookie = searchCookie('csrftoken');
        const response = await axios.delete(`${BASE_URL}/users/skills/${skillId}`,{
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        const status = response.data.status;
        return status === 200;
    }catch (error) {
        console.log(`Could not delete skill with id ${skillId}`);
    }
    return false;
}
export async function addTechStackSection(sectionName,skills){
    try{
        let cookie = searchCookie('csrftoken');
        const body = {'section_name':sectionName,'skills_names':skills}
        const response = await axios.post(`${BASE_URL}/users/techstacks/`
            ,body,{
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        const status = response.data.status;
        return status === 200;
    }catch (error) {
        console.log(`Could not add techstack section`);
    }
    return false;
}
export async function deleteTechStackSection(sectionId){
    try{
        let cookie = searchCookie('csrftoken');
        const response = await axios.delete(`${BASE_URL}/users/techstacks/${sectionId}`
            ,{
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        const status = response.data.status;
        return status === 200;
    }catch (error) {
        console.log(`Could not delete techstack section due to error ${error}`);
    }
    return false;
}
export async function addProfileSection(name,content){
    try{
        let cookie = searchCookie('csrftoken');
        const body = {'name':name,'content':content,'hidden':false}
        const response = await axios.post(`${BASE_URL}/users/profile-sections/`,
            body,{
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        const id = response.data.id;
        if(typeof id === 'number')
            return id;
    }catch (error) {
        console.log(`Could not add profile section due to error ${error}`);
    }
    return false;
}
export async function modifyProfileSection(id,name,content){
    try{
        let cookie = searchCookie('csrftoken');
        const body = {'name':name,'content':content,'hidden':false}
        const response = await axios.put(`${BASE_URL}/users/profile-sections/${id}`,
            body,{
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        const status = response.data.status;
        return status === 200;
    }catch (error) {
        console.log(`Could not modify profile section due to error ${error}`);
    }
    return false;
}
export async function deleteProfileSection(id){
    try{
        let cookie = searchCookie('csrftoken');
        const response = await axios.delete(`${BASE_URL}/users/profile-sections/${id}`,
            {
            headers: {
                'X-CSRFToken': cookie
            },
            withCredentials: true
        });
        const status = response.data.status;
        return status === 200;
    }catch (error) {
        console.log(`Could not delete section due to error ${error}`);
    }
    return false;
}