import { useState, useEffect } from "react";
import { NavigationBar } from "./ProfilePage";
import { useParams } from "react-router-dom";
import { loadProjectPage,
         requestProjectJoin,
         leaveProject,
         fetchGithubStructure,
         getProjectTasks,
         fetchRepoBranches,
         createProjectTask,
         deleteProjectTasks,
         updateProjectTask,
         assignUsersToRole,
         kickUsersFromProject,
         editProjectRole,
         getRolePermissions
          } from "./utils/api-utlis";
import './assets/css/projectPage.css';
function SectionNavbar({setCurrentSection}){
    return(
        <nav id="projectNavbar">
            <button type="button"
                    className="projectNavBtn"
                    onClick={()=>setCurrentSection("preview")}
            >
                Preview
            </button>
            <button type="button"
                    className="projectNavBtn"
                    onClick={()=>setCurrentSection("main")}
            >
                Main page
            </button>
            <button type="button"
                    className="projectNavBtn"
                    onClick={()=>setCurrentSection("settings")}
            >
                Settings
            </button>
            <button type="button"
                    className="projectNavBtn"
                    onClick={()=>setCurrentSection("tasks")}
            >
                Tasks
            </button>
            <button type="button"
                    className="projectNavBtn"
                    onClick={()=>setCurrentSection("roles")}
            >
                Roles
            </button>
            <button type="button"
                    className="projectNavBtn"
                    onClick={()=>setCurrentSection("group_chat")}
            >
                Group chat
            </button>
        </nav>
    );
}
function ProjectHeader({projectName}){
    return <h1 className="projectPreviewTitle">{projectName}</h1>;
}
function MembershipActions({role,projectId}){
    const [isMember,setIsMember] = useState(role);
    const handleRequestJoin = async () => {
        const response = await requestProjectJoin(projectId);
        if(response)setIsMember(false);
    }
    const handleLeaveProject = async () => {
        const response = await leaveProject(projectId);
        if(response)setIsMember(false);
    };
    if(isMember){
        return (
            <div className="membershipActions">
                <button className="denyBtn" onClick={handleLeaveProject}>
                    Leave project
                </button>
            </div>
        );
    }
    return (
        <div className="membershipActions">
            <button className="addBtn" onClick={handleRequestJoin}>
                Request to join
            </button>
        </div>
    );
}
function RequirementsPanel({requirements}){
    return (
        <div id="requirementsPanel">
            <h2 className="sectionHeading">Skills required</h2>
            {Object.entries(requirements || {}).map(([sectionName,skills])=>{
                return (
                    <div key={sectionName} className="profileSectionBox">
                        <h3 className="sectionTitle">{sectionName}</h3>
                        <div className="skillsGrid">
                            {(skills || []).map((skill,index)=>{
                                const skillName = typeof skill === 'string' ? skill : skill.skill;
                                return (
                                    <span key={skill.id ?? index} className="skillBadge">
                                        <span>{skillName}</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
function DomainsPanel({domains}){
    return (
        <div id="domainsPanel">
            <h2 className="sectionHeading">Project domains</h2>
            <div className="domainsList">
                {(domains || []).map((d)=>(
                    <span key={d.domain} className="skillBadge">{d.domain}</span>
                ))}
            </div>
        </div>
    );
}
function Preview({data}){
    if(!data) return null;
    const {project_name,description,role,requirements,domains,project_id} = data;
    return (
        <div id="previewLayout">
            <RequirementsPanel requirements={requirements}/>
            <div id="previewCentral">
                <ProjectHeader projectName={project_name}/>
                <MembershipActions role={role!=='visitor'} projectId={project_id}/>
                <p className="previewDescription">{description}</p>
            </div>
            <DomainsPanel domains={domains}/>
        </div>
    );
}
function MainPage({tasks}){
    return (
        <div id="mainPageContainer">
            <div id="mainPageLeft">
            </div>
            <div id="mainPageRight">
                <h2 className="sectionHeading">Project tasks</h2>
                {(tasks || []).map((task)=>(
                    <div key={task.id} className="profileSectionBox taskEntry">
                        <div className="taskEntryHeader">
                            <h3 className="sectionTitle">{task.name}</h3>
                            <input type="checkbox" checked={task.finished} disabled readOnly/>
                        </div>
                        <div className="taskDates">
                            <span>Start: {task.start_date}</span>
                            <span>End: {task.end_date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
function Settings(){
    return (
        <div id="settingsContainer">
        </div>
    );
}
function GithubTreeNode({owner,repo,branch,item,onFileSelect,selectedFiles}){
    const [expanded,setExpanded] = useState(false);
    const [children,setChildren] = useState(null);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        setChildren(null);
        setExpanded(false);
    }, [branch]);

    const handleToggle = async () => {
        if(item.type !== 'dir') return;
        if(!expanded && children === null){
            setLoading(true);
            const result = await fetchGithubStructure(owner,repo,item.path,branch);
            setChildren(result);
            setLoading(false);
        }
        setExpanded(prev => !prev);
    };

    if(item.type === 'file'){
        const isSelected = selectedFiles.includes(item.path);
        return (
            <div className="githubTreeItem githubTreeFile">
                <span className={isSelected ? 'githubTreeFileSelected' : ''}
                      onClick={()=>onFileSelect(item.path)}
                >
                    {item.name}
                </span>
            </div>
        );
    }
    return (
        <div className="githubTreeItem githubTreeDir">
            <span onClick={handleToggle}>
                {expanded ? '▾' : '▸'} {item.name}
            </span>
            {expanded && (
                <div className="githubTreeChildren">
                    {loading && <span className="githubTreeLoading">Loading...</span>}
                    {children && children.map(child => (
                        <GithubTreeNode key={child.path}
                                        owner={owner}
                                        repo={repo}
                                        branch={branch}
                                        item={child}
                                        onFileSelect={onFileSelect}
                                        selectedFiles={selectedFiles}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
function GithubRepoBrowser({repoInfo,projectName,onFileSelect,selectedFiles}){
    const [branches,setBranches] = useState([]);
    const [selectedBranch,setSelectedBranch] = useState('');
    const [rootItems,setRootItems] = useState(null);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchRepoBranches(projectName,repoInfo.id).then(result => {
            if(!cancelled && result.length > 0){
                setBranches(result);
                setSelectedBranch(result[0]);
            }
        });
        return () => { cancelled = true; };
    }, [projectName,repoInfo.id]);

    useEffect(() => {
        if(!selectedBranch) return;
        let cancelled = false;
        setLoading(true);
        setRootItems(null);
        fetchGithubStructure(repoInfo.owner,repoInfo.repo,'',selectedBranch).then(result => {
            if(!cancelled){
                setRootItems(result);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [repoInfo.owner,repoInfo.repo,selectedBranch]);

    return (
        <div className="githubRepoBrowser">
            <h4 className="githubRepoBrowserTitle">{repoInfo.name}</h4>
            {branches.length > 0 && (
                <select className="sectionSelect"
                        value={selectedBranch}
                        onChange={(e)=>setSelectedBranch(e.target.value)}
                >
                    {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
            )}
            {loading && <span className="githubTreeLoading">Loading...</span>}
            {rootItems && rootItems.map(item => (
                <GithubTreeNode key={item.path}
                                owner={repoInfo.owner}
                                repo={repoInfo.repo}
                                branch={selectedBranch}
                                item={item}
                                onFileSelect={onFileSelect}
                                selectedFiles={selectedFiles}
                />
            ))}
        </div>
    );
}
function TaskForm({editingTaskId,
                   setEditingTaskId,
                   setTasks,
                   name,
                   setName,
                   description,
                   setDescription,
                   startDate,
                   setStartDate,
                   endDate,
                   setEndDate,
                   finished,
                   setFinished,
                   usernames,
                   setUsernames,
                   resourcePaths,
                   setResourcePaths,
                   repos,
                   setRepos,
                   projectUsernames,
                   projectRepos,
                   projectName,
                   projectId}){
    const resetForm = () => {
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setFinished(false);
        setUsernames([]);
        setResourcePaths([]);
        setRepos([]);
        setEditingTaskId(null);
    };
    const handleNameChange = (value) => {
        setName(value);
        setEditingTaskId(null);
    };
    const addUsername = (username) => {
        if(username && !usernames.includes(username)) setUsernames(prev => [...prev, username]);
    };
    const removeUsername = (username) => {
        setUsernames(prev => prev.filter(u => u !== username));
    };
    const addRepo = (repoName) => {
        if(repoName && !repos.includes(repoName)) setRepos(prev => [...prev, repoName]);
    };
    const removeRepo = (repoName) => {
        setRepos(prev => prev.filter(r => r !== repoName));
    };
    const toggleResourcePath = (path) => {
        setResourcePaths(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);
    };
    const handleAdd = async () => {
        if(name.trim() === '') return;
        const response = await createProjectTask(projectId,
                                                name.trim(),
                                                description,
                                                startDate,
                                                endDate,
                                                usernames,
                                                resourcePaths);
        if(response){
            const newTask = {
                id: Date.now(),
                name: name.trim(),
                description,
                start_date: startDate,
                end_date: endDate,
                finished,
                usernames,
                repos,
                resource_paths: resourcePaths
            };
            setTasks(prev => [...prev, newTask]);
            resetForm();
        }
    };
    const handleModify = async () => {
        if(name.trim() === '') return;
        const response = await updateProjectTask(projectId,
                                                 editingTaskId,{
                                                    'name':name,
                                                    'description':description,
                                                    'start_date':startDate,
                                                    'end_date':endDate
                                                 });
        if(response){
            setTasks(prev => prev.map(t => t.id === editingTaskId
                ? {...t,
                name: name.trim(),
                description,
                start_date: startDate,
                end_date: endDate,
                finished,
                usernames,
                repos,
                resource_paths: resourcePaths}
                : t
            ));
            resetForm();
        }
    };
    return (
        <div className="technicalSkillInputs">
            <input type="text"
                   className="addSectionInput"
                   placeholder="Task name..."
                   value={name}
                   onChange={(e)=>handleNameChange(e.target.value)}
            />
            <div className="taskAssociationsZone">
                <div className="taskSelectGroup">
                    <select className="sectionSelect"
                            value=""
                            onChange={(e)=>addUsername(e.target.value)}
                    >
                        <option value="">Add assigned user...</option>
                        {projectUsernames.filter(u=>!usernames.includes(u)).map(u=>(
                            <option key={u} value={u}>{u}</option>
                        ))}
                    </select>
                    <div className="taskBadgeList">
                        {usernames.map(u=>(
                            <span key={u} className="skillBadge">
                                <span>{u}</span>
                                <button type="button" className="deleteBtn" onClick={()=>removeUsername(u)}>X</button>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="taskSelectGroup">
                    <select className="sectionSelect"
                            value=""
                            onChange={(e)=>addRepo(e.target.value)}
                    >
                        <option value="">Add related repository...</option>
                        {projectRepos.filter(r=>!repos.includes(r.name)).map(r=>(
                            <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                    </select>
                    <div className="taskBadgeList">
                        {repos.map(r=>(
                            <span key={r} className="skillBadge">
                                <span>{r}</span>
                                <button type="button" className="deleteBtn" onClick={()=>removeRepo(r)}>X</button>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="githubBrowsersZone">
                    {repos.map(repoName => {
                        const repoInfo = projectRepos.find(r => r.name === repoName);
                        if(!repoInfo) return null;
                        return (
                            <GithubRepoBrowser key={repoInfo.id}
                                                repoInfo={repoInfo}
                                                projectName={projectName}
                                                onFileSelect={toggleResourcePath}
                                                selectedFiles={resourcePaths}
                            />
                        );
                    })}
                </div>
                <div className="taskBadgeList">
                    {resourcePaths.map(p => (
                        <span key={p} className="skillBadge">
                            <span>{p}</span>
                            <button type="button" className="deleteBtn" onClick={()=>toggleResourcePath(p)}>X</button>
                        </span>
                    ))}
                </div>
            </div>
            <textarea className="sectionContentInput"
                      placeholder="Task description..."
                      value={description}
                      onChange={(e)=>setDescription(e.target.value)}
            />
            <input type="date"
                   className="addSectionInput"
                   value={startDate}
                   onChange={(e)=>setStartDate(e.target.value)}
            />
            <input type="date"
                   className="addSectionInput"
                   value={endDate}
                   onChange={(e)=>setEndDate(e.target.value)}
            />
            <label className="taskFinishedLabel">
                <input type="checkbox"
                       checked={finished}
                       onChange={(e)=>setFinished(e.target.checked)}
                />
                Finished
            </label>
            <button className={editingTaskId === null ? "addBtn" : "editSubmitBtn"}
                    onClick={editingTaskId === null ? handleAdd : handleModify}
            >
                {editingTaskId === null ? "Add task" : "Modify task"}
            </button>
        </div>
    );
}
function Tasks({tasks,
                setTasks,
                editingTaskId,
                setEditingTaskId,
                name,
                setName,
                description,
                setDescription,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
                finished,
                setFinished,
                usernames,
                setUsernames,
                resourcePaths,
                setResourcePaths,
                repos,
                setRepos,
                projectUsernames,
                projectRepos,
                projectName,
                projectId}){
    useEffect(() => {
        if(!projectId) return;
        const fetchTasks = async () =>{
            const response = await getProjectTasks(projectId);
            setTasks(response);
        }
        fetchTasks();
    }, [projectId]);

    const handleDelete = async (name) => {
        if(!projectId)return;
        const response = await deleteProjectTasks(projectId,[name]);
        if(response)setTasks(prev => prev.filter(t => t.name !== name));
    };
    const handleEditClick = (task) => {
        setName(task.name);
        setDescription(task.description);
        setStartDate(task.start_date);
        setEndDate(task.end_date);
        setFinished(task.finished);
        setUsernames(task.usernames || []);
        setResourcePaths(task.resource_paths || []);
        setRepos(task.repos || []);
        setEditingTaskId(task.id);
    };

    return (
        <div id="tasksContainer">
            {tasks.map((task)=>(
                <div key={task.id} className="profileSectionBox taskEntry">
                    <div className="taskEntryHeader">
                        <h3 className="sectionTitle">{task.name}</h3>
                        <input type="checkbox" checked={task.finished} disabled readOnly/>
                    </div>
                    <p className="taskDescription">{task.description}</p>
                    <div className="taskDates">
                        <span>Start: {task.start_date}</span>
                        <span>End: {task.end_date}</span>
                    </div>
                    <div className="taskAffiliates">
                        <span>Assigned: {(task.usernames || []).join(', ') || '—'}</span>
                        <span>Files: {(task.resource_paths || []).join(', ') || '—'}</span>
                    </div>
                    <div className="taskEntryActions">
                        <button type="button" className="deleteBtn" onClick={()=>handleDelete(task.name)}>X</button>
                        <button type="button" className="editBtn" onClick={()=>handleEditClick(task)}>Modify</button>
                    </div>
                </div>
            ))}
            <TaskForm editingTaskId={editingTaskId}
                      setEditingTaskId={setEditingTaskId}
                      setTasks={setTasks}
                      name={name} setName={setName}
                      description={description} setDescription={setDescription}
                      startDate={startDate} setStartDate={setStartDate}
                      endDate={endDate} setEndDate={setEndDate}
                      finished={finished} setFinished={setFinished}
                      usernames={usernames} setUsernames={setUsernames}
                      resourcePaths={resourcePaths} setResourcePaths={setResourcePaths}
                      repos={repos} setRepos={setRepos}
                      projectUsernames={projectUsernames}
                      projectRepos={projectRepos}
                      projectName={projectName}
                      projectId={projectId}
            />
        </div>
    );
}
function RoleSection({roleName,users,projectId}){
    const [permissions,setPermissions] = useState(null);
    useEffect(() => {
        if(!projectId || !roleName) return;
        const fetchPermissions = async () => {
            const result = await getRolePermissions(projectId,roleName);
            setPermissions(result);
        };
        fetchPermissions();
    }, [projectId,roleName]);

    return (
        <div className="profileSectionBox">
            <h3 className="sectionTitle">{roleName}</h3>
            <div className="skillsGrid">
                {(users || []).map(u => (
                    <span key={u.id} className="skillBadge">
                        <span>{u.username}</span>
                    </span>
                ))}
            </div>
            <div className="rolePermissionsGrid">
                {Object.entries(permissions?.permissions || {}).map(([key,value]) => (
                    <label key={key} className="rolePermissionLabel">
                        <input type="checkbox" style={{background:'black'}}checked={!!value} disabled readOnly/>
                        {key}
                    </label>
                ))}
            </div>
        </div>
    );
}
function NewRoleForm({permissionKeys,projectUsers}){
    const [roleName,setRoleName] = useState('');
    const [selectedPermissions,setSelectedPermissions] = useState({});
    const [selectedUsers,setSelectedUsers] = useState([]);

    const togglePermission = (key) => {
        setSelectedPermissions(prev => ({...prev, [key]: !prev[key]}));
    };
    const addUser = (username) => {
        if(username && !selectedUsers.includes(username)) setSelectedUsers(prev => [...prev, username]);
    };
    const removeUser = (username) => {
        setSelectedUsers(prev => prev.filter(u => u !== username));
    };
    const handleCreateRole = () => {
        if(roleName.trim() === '') return;
        // TODO: send create-role request to backend
    };

    return (
        <div className="technicalSkillInputs">
            <input type="text"
                   className="addSectionInput"
                   placeholder="New role name..."
                   value={roleName}
                   onChange={(e)=>setRoleName(e.target.value)}
            />
            <div className="rolePermissionsGrid">
                {permissionKeys.map(key => (
                    <label key={key} className="rolePermissionLabel">
                        <input type="checkbox"
                               checked={!!selectedPermissions[key]}
                               onChange={()=>togglePermission(key)}
                        />
                        {key}
                    </label>
                ))}
            </div>
            <select className="sectionSelect"
                    value=""
                    onChange={(e)=>addUser(e.target.value)}
            >
                <option value="">Add user to this role...</option>
                {projectUsers.filter(u=>!selectedUsers.includes(u)).map(u=>(
                    <option key={u} value={u}>{u}</option>
                ))}
            </select>
            <div className="taskBadgeList">
                {selectedUsers.map(u=>(
                    <span key={u} className="skillBadge">
                        <span>{u}</span>
                        <button type="button" className="deleteBtn" onClick={()=>removeUser(u)}>X</button>
                    </span>
                ))}
            </div>
            <button type="button" className="addBtn" onClick={handleCreateRole}>
                Create role
            </button>
        </div>
    );
}
function Roles({data}){
    if(!data) return null;
    const staff = data.staff || {};
    const permissionKeys = Object.keys(data.visitor_permissions || {});
    const projectUsers = Object.values(staff).flat().map(u=>u.username);
    return (
        <div id="rolesContainer">
            {Object.entries(staff).map(([roleName,users])=>(
                <RoleSection key={roleName} roleName={roleName} users={users} projectId={data.project_id}/>
            ))}
            <NewRoleForm permissionKeys={permissionKeys} projectUsers={projectUsers}/>
        </div>
    );
}
function GroupChatMessage({message,currentUserId}){
    const isOwnMessage = message.sender_id === currentUserId;
    return (
        <span className={`chatMessage ${isOwnMessage ? 'ownMessage' : 'otherMessage'}`}>
            {message.content}
        </span>
    );
}
function GroupChat({data}){
    const [messages,setMessages] = useState([]);
    const [newMessage,setNewMessage] = useState('');
    const currentUserId = data?.user_id ?? null;

    useEffect(() => {
        // TODO: fetch messages for this project's group conversation and setMessages(...)
    }, [data?.project_id]);

    const handleSend = () => {
        if(newMessage.trim() === '') return;
        const newMsg = {
            id: Date.now(),
            sender_id: currentUserId,
            content: newMessage.trim()
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        // TODO: send the message to the backend for this project's group conversation
    };

    return (
        <div id="chatContainer">
            <div id="conversationView">
                <div id="conversationViewHeader">
                    <span className="conversationViewName">{data?.project_name} conversation</span>
                </div>
                <div id="messagesArea">
                    {messages.map((message)=>(
                        <GroupChatMessage key={message.id} message={message} currentUserId={currentUserId}/>
                    ))}
                </div>
                <div id="messageInputRow">
                    <textarea id="messageInput"
                              value={newMessage}
                              onChange={(e)=>setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                    />
                    <button type="button" id="sendMessageBtn" onClick={handleSend}>Send</button>
                </div>
            </div>
            <div id="conversationsList">
                <div className="conversationHeaderItem activeConversation">
                    <span className="conversationHeaderName">{data?.project_name} group chat</span>
                </div>
            </div>
        </div>
    );
}
function RenderCurrentSection({currentSection,
                               data,
                               tasks,
                               setTasks,
                               editingTaskId,
                               setEditingTaskId,
                               taskName,
                               setTaskName,
                               taskDescription,
                               setTaskDescription,
                               taskStartDate,
                               setTaskStartDate,
                               taskEndDate,
                               setTaskEndDate,
                               taskFinished,
                               setTaskFinished,
                               taskUsernames,
                               setTaskUsernames,
                               taskResourcePaths,
                               setTaskResourcePaths,
                               taskRepos,
                               setTaskRepos}){
    switch(currentSection){
        case 'preview':
            return <Preview data={data}/>
        case 'main':
            return <MainPage tasks={tasks}/>
        case 'settings':
            return <Settings/>
        case 'tasks': {
            const projectUsernames = Object.values(data?.staff || {}).flat().map(u=>u.username);
            const projectRepos = data?.repos || [];
                        return <Tasks tasks={tasks} setTasks={setTasks}
                          editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId}
                          name={taskName} setName={setTaskName}
                          description={taskDescription} setDescription={setTaskDescription}
                          startDate={taskStartDate} setStartDate={setTaskStartDate}
                          endDate={taskEndDate} setEndDate={setTaskEndDate}
                          finished={taskFinished} setFinished={setTaskFinished}
                          usernames={taskUsernames} setUsernames={setTaskUsernames}
                          resourcePaths={taskResourcePaths} setResourcePaths={setTaskResourcePaths}
                          repos={taskRepos} setRepos={setTaskRepos}
                          projectUsernames={projectUsernames}
                          projectRepos={projectRepos}
                          projectName={data?.project_name}
                          projectId={data?.project_id}
                    />
        }
        case 'roles':
            return <Roles data={data}/>
        case 'group_chat':
            return <GroupChat data={data}/>
        default:
            return <h1>Unknown section requested:{currentSection}</h1>
    }
}
function ProjectPage(){
    const {project} = useParams();
    const [data,setData] = useState(null);
    const [currentSection,setCurrentSection] = useState('preview');
    const [tasks,setTasks] = useState([]);
    const [editingTaskId,setEditingTaskId] = useState(null);
    const [taskName,setTaskName] = useState('');
    const [taskDescription,setTaskDescription] = useState('');
    const [taskStartDate,setTaskStartDate] = useState('');
    const [taskEndDate,setTaskEndDate] = useState('');
    const [taskFinished,setTaskFinished] = useState(false);
    const [taskUsernames,setTaskUsernames] = useState([]);
    const [taskResourcePaths,setTaskResourcePaths] = useState([]);
    const [taskRepos,setTaskRepos] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            const stats = await loadProjectPage(project);
            console.log(JSON.stringify(stats));
            setData(stats);
        };
        fetchData();
    }, [project]);
    return (
    <div id="mainProjectPageDiv">
        <NavigationBar/>
        <div className="mainProjectContent">
            <SectionNavbar setCurrentSection={setCurrentSection}/>
            <div className="mainProjectContent">
                <RenderCurrentSection currentSection={currentSection}
                                      data={data}
                                      tasks={tasks} setTasks={setTasks}
                                      editingTaskId={editingTaskId} setEditingTaskId={setEditingTaskId}
                                      taskName={taskName} setTaskName={setTaskName}
                                      taskDescription={taskDescription} setTaskDescription={setTaskDescription}
                                      taskStartDate={taskStartDate} setTaskStartDate={setTaskStartDate}
                                      taskEndDate={taskEndDate} setTaskEndDate={setTaskEndDate}
                                      taskFinished={taskFinished} setTaskFinished={setTaskFinished}
                                      taskUsernames={taskUsernames} setTaskUsernames={setTaskUsernames}
                                      taskResourcePaths={taskResourcePaths} setTaskResourcePaths={setTaskResourcePaths}
                                      taskRepos={taskRepos} setTaskRepos={setTaskRepos}
                />
            </div>
        </div>
    </div>);
}
export default ProjectPage;