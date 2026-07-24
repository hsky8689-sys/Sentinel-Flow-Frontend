import { useEffect, useState } from "react";
import { createProject } from "./utils/api-utlis"
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "./ProfilePage";
function GithubReposInput({repos,
                           setRepos,
                           selectedId,
                           setSelectedId}){
    const [newName,setNewName] = useState('');
    const [newURL,setNewURL] = useState('');
    const [newToken,setNewToken] = useState('');
    
    const resetForm = () => {
        setNewName('');
        setNewURL('');
        setNewToken('');
    }

    useEffect(()=>{
        const foundRepo = repos.find(repo=>repo.id === selectedId);
        if(foundRepo !== undefined){
            setNewName(foundRepo.name);
            setNewURL(foundRepo.link);
            setNewToken(foundRepo.token);
        }
        else resetForm();
    },[selectedId]);

    const handleRepoAddition = () => {
        setSelectedId(-1);
        const oldLen = repos.length;
        const entity = {
            id:oldLen+1,
            name:newName,
            link:newURL,
            token:newToken
        }
        const newRepos = Array.of(...repos,entity);
        setRepos(newRepos);
        resetForm();
    }

    const handleRepoModification = () => {
        const newRepos = repos.map(repo=>{
            if(repo.id === selectedId){
                return {
                    id:selectedId,
                    name:newName,
                    link:newURL,
                    token:newToken
                }
            }
            return repo;
        })
        setRepos(newRepos);
        setSelectedId(-1);
        resetForm();
    }
    return(
        <div>
            <input type="text"
                   placeholder="Add the name of then new GitHub repository..."
                   value={newName}
                   onChange={(e)=>setNewName(e.target.value)}
            />
            <input type="text"
                   placeholder="Add a valid GitHub repository URL..."
                   value={newURL}
                   onChange={(e)=>setNewURL(e.target.value)}
            />
            <input type="text"
                   placeholder="Add the acces token of then new GitHub repository..."
                   value={newToken}
                   onChange={(e)=>setNewToken(e.target.value)}
            />
            <button 
                    onClick={selectedId === -1 ? handleRepoAddition : handleRepoModification}
            >
                {selectedId === -1 ? 'Add new repository' : 'Modify repository'}
            </button>
        </div>
    );
}
function GithubRepos({repos,setRepos,selectedId,setSelectedId}){
    const handleRepoDeletion = (id) => {
        const newRepos = repos.filter(repo=>repo.id!==id);
        setRepos(newRepos);
    }
    return (
        <div>{
            (Array.isArray(repos) ? repos : Object.values(repos))
            .map((repo)=>{
                const {id,name,link,token} = repo;
                return (
                    <div>
                        <div>
                            <input type="text"
                                   value={name}
                                   readOnly={true}
                            />
                            <input type="text"
                                   value={link}
                                   readOnly={true}
                            />
                            <input type="text"
                                   value={token}
                                   readOnly={true}
                            />
                        </div>
                        <button onClick={()=>handleRepoDeletion(id)}>
                            X
                        </button>
                        <button onClick={()=>setSelectedId(id)}>
                            Edit repo data
                        </button>
                    </div>
                );
            })
        }
        <GithubReposInput repos={repos}
                          setRepos={setRepos}
                          selectedId={selectedId}
                          setSelectedId={setSelectedId}
        />
        </div>
    );
}
function NeededSkillsInput({skills,setSkills}){
    return(
        <></>
    );
}
function NeededSkills({skills,setSkills}){
    const deleteSkillSection = (section) => {
        
    }
    const deleteSkill = (section,skill) => {
        
    }
    return (
        <div>{
        
        }   
        </div>
    );
}
function ProjectCreationPage(){
    const nav = useNavigate;
    
    const [name,setName] = useState('');
    const [description,setDescription] = useState('');
    const [githubRepos,setGithubRepos] = useState([]);
    const [neededSkills,setNeededSkills] = useState([]);
    const [selectedRepoId,setSelectedRepoId] = useState(-1);//for repository modification

    const handleProjectCreation = async () => {
        const response = await createProject(name,description,githubRepos,neededSkills);
        if(typeof response === 'string' && response !== ''){
            nav(`/project-page/${response}`);
        }
    }
    return (
    <div>
        <NavigationBar/>
        <div>
            <input type="text"
                   value={name}
                   onChange={(e)=>setName(e.target.value)}
                   placeholder="Enter a name for the new project.The name must only contain capital letters,small letters and _ or - "
            />
            <textarea value={description}
                      onChange={(e)=>setDescription(e.target.value)}
                      placeholder="Describe your project idea in maximum 5000 characters..."
            />
            <GithubRepos repos={githubRepos}
                         setRepos={setGithubRepos}
                         selectedId={selectedRepoId}
                         setSelectedId={setSelectedRepoId}
            />
            <NeededSkills skills={neededSkills}
                          setSkills={setNeededSkills}
            />
            <button onClick={handleProjectCreation}>
                Create project
            </button>
        </div>
    </div>
    );
}
export default ProjectCreationPage