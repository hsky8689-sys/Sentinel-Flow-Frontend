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
export async function accesInbox(){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/users/connections-page`;
        const response = await axios.get(url,{
            headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data;
    }catch(error){
        console.log(`Could not create project due to error ${error}`)
    }
    return {};
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
export async function acceptProjectJoinRequest(senderId, receiverId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/api/requests/project/handle`;
        const body = {action: 'accept', sender_id: senderId, receiver_id: receiverId};
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not accept project join request because of error ${error}`);
    }
    return false;
}
export async function declineProjectJoinRequest(senderId, receiverId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/api/requests/project/handle`;
        const body = {action: 'decline', sender_id: senderId, receiver_id: receiverId};
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not decline project join request because of error ${error}`);
    }
    return false;
}
export async function acceptProjectInvite(inviteId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/invites/${inviteId}`;
        const body = {status: 'accepted'};
        const response = await axios.patch(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not accept project invite because of error ${error}`);
    }
    return false;
}
export async function declineProjectInvite(inviteId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/invites/${inviteId}`;
        const response = await axios.delete(url,{
            headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
                }
        );
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not decline project invite because of error ${error}`);
    }
    return false;
}
export async function acceptFileAccessRequest(senderId, receiverId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/api/requests/file-access/handle`;
        const body = {response: 'accept', sender_id: senderId, receiver_id: receiverId};
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not accept file access request because of error ${error}`);
    }
    return false;
}
export async function declineFileAccessRequest(senderId, receiverId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/api/requests/file-access/handle`;
        const body = {response: 'decline', sender_id: senderId, receiver_id: receiverId};
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not decline file access request because of error ${error}`);
    }
    return false;
}
export async function acceptMoveFileAccessRequest(senderId, receiverId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/api/requests/file-writers/handle`;
        const body = {response: 'ACCEPT', sender_id: senderId, receiver_id: receiverId};
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not accept move file access request because of error ${error}`);
    }
    return false;
}
export async function declineMoveFileAccessRequest(senderId, receiverId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/api/requests/file-writers/handle`;
        const body = {response: 'DENY', sender_id: senderId, receiver_id: receiverId};
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not decline move file access request because of error ${error}`);
    }
    return false;
}
// --- Deschidere / rezolvare conversație ---
export async function openChatRoom(convId = null, user1o1 = null){
    try{
        const params = new URLSearchParams();
        if(convId !== null) params.append('conv_id', convId);
        if(user1o1 !== null) params.append('user_1o1', user1o1);
        const url = `${BASE_URL}/chat/?${params.toString()}`;
        const response = await axios.get(url,{withCredentials:true});
        return response.data.status === 'success' ? response.data : null;
        // -> {chat_id, user_101, user_id} ; chat_id === -1 inseamna ca nu exista inca conversatie
    }catch(error){
        console.log(`Could not open chat room because of error ${error}`);
    }
    return null;
}
// --- Istoricul mesajelor unei conversatii ---
export async function loadChatMessages(conversationId, pageNumber, pageSize){
    try{
        const url = `${BASE_URL}/chat/api/${conversationId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        const response = await axios.get(url,{withCredentials:true});
        return response.data.success ? response.data.content : null;
        // -> [{sender_id, content, timestamp}, ...]
    }catch(error){
        console.log(`Could not load chat messages because of error ${error}`);
    }
    return null;
}

// --- Trimitere mesaj (salveaza in DB SI trimite pe websocket) ---
export async function sendMessage(content, conversationId = null, user1o1 = null){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/chat/api/message`;
        const body = {content};
        if(conversationId !== null) body.conversation_id = conversationId;
        if(user1o1 !== null) body.user_1o1 = user1o1;
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.success ? response.data.conversation_id : null;
    }catch(error){
        console.log(`Could not send message because of error ${error}`);
    }
    return null;
}

// --- Conversatii de grup pe proiect ---
export async function loadProjectConversations(projectId, pageNumber, pageSize){
    try{
        const url = `${BASE_URL}/chat/conversations/projects/${projectId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        const response = await axios.get(url,{withCredentials:true});
        return response.data.success ? response.data.content : null;
        // -> [{id, last_message, is_group}, ...]
    }catch(error){
        console.log(`Could not load project conversations because of error ${error}`);
    }
    return null;
}

export async function createProjectGroupConversation(projectId, memberIds){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/chat/conversations/projects/${projectId}`;
        const body = {member_ids: memberIds};
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.success ? response.data.conversation_id : null;
    }catch(error){
        console.log(`Could not create project conversation because of error ${error}`);
    }
    return null;
}

export async function deleteProjectConversation(projectId, conversationId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/chat/conversations/projects/${projectId}`;
        const body = {conversation_id:conversationId}
        const response = await axios.delete(url,body,{
            headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
        }
        );
        return response.data.success === true;
    }catch(error){
        console.log(`Could not delete project conversation because of error ${error}`);
    }
    return false;
}
export async function loadUserConversations(pageNumber, pageSize){
    try{
         const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/chat/conversations?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        const response = await axios.get(url,{
            headers:{
                'X-CSRFToken': cookie
            },
            withCredentials:true
        });
        return response.data.success ? response.data : null;
    }catch(error){
        console.log(`Could not load conversations because of error ${error}`);
    }
    return null;
}
export async function loadProjectPage(projectName){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/project-page/${projectName}`;
        const response = await axios.get(url,{
            headers:{
                'X-CSRFToken': cookie
            },
            withCredentials:true
        });
        return response.status === 200 ? response.data.stats : null;
    }catch(error){
        console.log(`Could not load project page due to error ${error}`);
    }
    return null;
}
export async function requestProjectJoin(projectId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/api/${projectId}/request-join`;
        const response = await axios.post(url,null,{
            headers:{
                'X-CSRFToken': cookie
            },
            withCredentials:true
        });
        return response.status === 200;
    }catch(error){
        console.log(`Could not load project page due to error ${error}`);
    }
    return false;
}
export async function leaveProject(projectId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/${projectId}/project-exit`;
        const response = await axios.delete(url,{
            headers:{
                'X-CSRFToken': cookie
            },
            withCredentials:true
        });
        return response.status === 200;
    }catch(error){
        console.log(`Could not load project page due to error ${error}`);
    }
    return false;
}
export async function getProjectTasks(projectId){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/settings/${projectId}/tasks`;
        const response = await axios.get(url,{
            headers:{
                'X-CSRFToken': cookie
            },
            withCredentials:true
        });
        console.log(response.data.tasks);
        return response.status === 200 ? response.data.tasks : [];
    }catch(error){
        console.log(`Could not load project page due to error ${error}`);
    }
    return [];
}
export async function fetchRepoBranches(projectName,repoId){
    try{
        const cookie = searchCookie('csrftoken');
        const params = new URLSearchParams({project: projectName});
        if(repoId !== undefined && repoId !== null) params.append('repo_id', repoId);
        const url = `${BASE_URL}/projects/api/github/branches?${params.toString()}`;
        const response = await axios.get(url,{
            headers:{'X-CSRFToken':cookie},
            withCredentials:true
        });
        return response.data.status === 'success' ? response.data.branches : [];
    }catch(error){
        console.log(`Could not fetch repo branches due to error ${error}`);
    }
    return [];
}
export async function fetchGithubStructure(owner,repo,path='',branch=null){
    try{
        const cookie = searchCookie('csrftoken');
        let url = path
            ? `${BASE_URL}/projects/api/github/${owner}/${repo}/${path}`
            : `${BASE_URL}/projects/api/github/${owner}/${repo}`;
        if(branch) url += `?branch=${encodeURIComponent(branch)}`;
        const response = await axios.get(url,{
            headers:{'X-CSRFToken':cookie},
            withCredentials:true
        });
        return Array.isArray(response.data) ? response.data : [];
    }catch(error){
        console.log(`Could not fetch github structure due to error ${error}`);
    }
    return [];
}
export async function createProjectTask(projectId, title, description, startDate, endDate, usernames = [], resourcePaths = []){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/settings/${projectId}/tasks`;
        const body = {
            title,
            description,
            start_date: startDate,
            end_date: endDate,
            usernames,
            resource_paths: resourcePaths
        };
        const response = await axios.post(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success' ? response.data : null;
    }catch(error){
        console.log(`Could not create task because of error ${error}`);
    }
    return null;
}
export async function deleteProjectTasks(projectId, taskNames){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/settings/${projectId}/tasks`;
        const response = await axios.delete(url,{
            headers:{
                'X-CSRFToken':cookie
            },
            withCredentials:true,
            data:{removedTasks:taskNames}
        });
        return response.data.status === 'succes' || response.data.status === 'success';
    }catch(error){
        console.log(`Could not delete tasks because of error ${error}`);
    }
    return false;
}
export async function updateProjectTask(projectId, taskId, updates = {}){
    try{
        const cookie = searchCookie('csrftoken');
        const url = `${BASE_URL}/projects/settings/${projectId}/tasks`;
        const body = { task_id: taskId, ...updates };
        const response = await axios.patch(url,body,{
                headers:{
                    'X-CSRFToken':cookie},
                    withCredentials:true
            });
        return response.data.status === 'success';
    }catch(error){
        console.log(`Could not update task because of error ${error}`);
    }
    return false;
}