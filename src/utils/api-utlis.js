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
export async function logout(){
    try{
        const csrfToken = await getCookie();
        const response = await axios.post(`${BASE_URL}/users/logout`,null,
            {
            headers:{
                'X-CSRFToken':csrfToken
            },
            withCredentials:true
        });
        return response.status === 200;
    }catch(error){
        console.log(`Could not log out because of error ${error}`)
    }
    return false;
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
        return status === 'success';
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
        return status === 'success';
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
        return status === 'success';
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
        return status === 'success';
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
        return status === 'success';
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
        return status === 'success';
    }catch (error) {
        console.log(`Could not delete section due to error ${error}`);
    }
    return false;
}
export async function addProfilePicture(file){
    try{
        let cookie = searchCookie('csrftoken');
        const formData = new FormData();
        formData.append('picture', file);
        const response = await axios.post(`${BASE_URL}/users/profile-pictures/`,
            formData,
            {headers: {
                'X-CSRFToken': cookie,
            },
            withCredentials: true
        });
        const status = response.data.status;
        if(status === 'success'){
            return `${BASE_URL}${response.data.photo_url}`;
        }
    }catch (error) {
        console.log(`Could not add profile picture due to error: ${error}`);
    }
    return '';
}
export async function addBackgroundPicture(file){
    try{
        let cookie = searchCookie('csrftoken');
        const formData = new FormData();
        formData.append('picture', file);
        const response = await axios.post(`${BASE_URL}/users/background-pictures/`,
            formData,
            {headers: {
                'X-CSRFToken': cookie,
            },
            withCredentials: true
        });
        const status = response.data.status;
        if(status === 'success'){
            return `${BASE_URL}${response.data.photo_url}`;
        }
    }catch (error) {
        console.log(`Could not add background picture due to error ${error}`);
    }
    return '';
}
export async function sendFriendRequest(receiverId){
    try{
        let cookie = searchCookie('csrftoken');
        const body = {'receiver_id':receiverId}
        const response = await axios.post(`${BASE_URL}/users/friend-requests`,
                                    body,{
                                        headers: {
                                            'X-CSRFToken': cookie,
                                        },
                                        withCredentials:true
                                    });
        return response.data.status === 'success' ? response.data.request_id : -1;
    }catch(error){
        console.log(`Could not send friend request because of error ${error}`);
    }
    return -1;
}
export async function acceptFriendRequest(requestId){
    const cookie = searchCookie('csrftoken');
    const url = `${BASE_URL}/users/friend-requests/${requestId}`;
    const body = {'status':'pending'};
    try{
        const response = await axios.patch(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not send accept request because of error ${error}`);
    }
    return false;
}
export async function deleteFriendRequest(requestId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/users/friend-requests/${requestId}`;
        const response = await axios.delete(url,{
            headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
                }
        );
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not delete friend request because of error ${error}`);
    }
    return false;
}
export async function removeFriend(userId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/users/${userId}/friendship`;
        const response = await axios.delete(url,{
            headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
                }
        );
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not remove friend because of error ${error}`);
    }
    return false;
}
export async function searchQuery(query){
    try{
      if(query === '')return{};
      const cookie = searchCookie('csrftoken');
      const url = `${BASE_URL}/users/search/api`;
      const body = {'query':query};
      const response = await axios.post(url,body,{
            headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
      return response.data.results;
    }catch(error){
        console.log(`Could not search because of error ${error}`);
        return {};
    }
}
export async function createProject(name,description,neededSkills,githubRepos){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/users/project-creation`;
        const body = {
            'name':name,
            'description':description,
            'needed skills':neededSkills,
            'github_repos':githubRepos
        }
        const response = await axios.post(url,body,{
            headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.project.name;
    }catch(error){
        console.log(`Could not create project due to error ${error}`)
    }
    return '';
}