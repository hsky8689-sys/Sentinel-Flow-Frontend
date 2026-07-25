import { useEffect, useState } from "react";
import { createProject } from "./utils/api-utlis"
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "./ProfilePage";
import './assets/css/projectCreationPage.css'
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
            setNewName(foundRepo.github_repo_name);
            setNewURL(foundRepo.github_repo_link);
            setNewToken(foundRepo.github_repo_token);
        }
        else resetForm();
    },[selectedId]);

    const handleRepoAddition = () => {
        setSelectedId(-1);
        const oldLen = repos.length;
        const entity = {
            id:oldLen+1,
            github_repo_name:newName,
            github_repo_link:newURL,
            github_repo_token:newToken
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
                    github_repo_name:newName,
                    github_repo_link:newURL,
                    github_repo_token:newToken
                }
            }
            return repo;
        })
        setRepos(newRepos);
        setSelectedId(-1);
        resetForm();
    }
    return(
        <div className="technicalSkillInputs">
            <input type="text"
                   className="addSectionInput"
                   placeholder="Add the name of then new GitHub repository..."
                   value={newName}
                   onChange={(e)=>setNewName(e.target.value)}
            />
            <input type="text"
                   className="addSkillInput"
                   placeholder="Add a valid GitHub repository URL..."
                   value={newURL}
                   onChange={(e)=>setNewURL(e.target.value)}
            />
            <input type="text"
                   className="addSkillInput"
                   placeholder="Add the acces token of then new GitHub repository..."
                   value={newToken}
                   onChange={(e)=>setNewToken(e.target.value)}
            />
            <button className={selectedId === -1 ? "addBtn" : "editBtn"}
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
        <div className="githubReposContainer">
        <h2 className="sectionHeading">GitHub repositories</h2>
        {
            (Array.isArray(repos) ? repos : Object.values(repos))
            .map((repo)=>{
                const {id,github_repo_name,github_repo_link,github_repo_token} = repo;
                return (
                    <div key={id} className="profileSectionBox repoEntry">
                        <div className="repoEntryFields">
                            <input type="text"
                                   className="addSectionInput"
                                   value={github_repo_name}
                                   readOnly={true}
                            />
                            <input type="text"
                                   className="addSectionInput"
                                   value={github_repo_link}
                                   readOnly={true}
                            />
                            <input type="text"
                                   className="addSectionInput"
                                   value={github_repo_token}
                                   readOnly={true}
                            />
                        </div>
                        <div className="repoEntryActions">
                            <button className="deleteBtn" onClick={()=>handleRepoDeletion(id)}>
                                X
                            </button>
                            <button className="editBtn" onClick={()=>setSelectedId(id)}>
                                Edit repo data
                            </button>
                        </div>
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
function NeededSkillsInput({skills,
                            setSkills,
                            categoryTitle,
                            setCategoryTitle,
                            skillInputs,
                            setSkillInputs,
                            editingSkill,
                            setEditingSkill,
                            editingCategory,
                            setEditingCategory}){
    const handleCategoryTitleChange = (value) => {
        setCategoryTitle(value);
        setEditingSkill(null);
        setEditingCategory(null);
    };
    const resetForm = () => {
        setCategoryTitle('');
        setSkillInputs(['']);
        setEditingSkill(null);
        setEditingCategory(null);
    };
    const handleAddInputRow = () => {
        if(skillInputs.length < 5) setSkillInputs(prev => [...prev, '']);
    };
    const handleSkillInputChange = (index, value) => {
        setSkillInputs(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };
    const handleAdd = () => {
        const trimmedCategory = categoryTitle.trim();
        const newSkillNames = skillInputs.map(s => s.trim()).filter(s => s !== '');
        if(trimmedCategory === '' || newSkillNames.length === 0) return;
        const existing = skills[trimmedCategory] || [];
        const newSkills = {
            ...skills,
            [trimmedCategory]: [...existing, ...newSkillNames]
        };
        setSkills(newSkills);
        setSkillInputs(['']);
    };
    const handleModifySkill = () => {
        const trimmedSkill = (skillInputs[0] || '').trim();
        if(trimmedSkill === '') return;
        const {category, oldSkillName} = editingSkill;
        const newSkills = {
            ...skills,
            [category]: skills[category].map(skill => skill === oldSkillName ? trimmedSkill : skill)
        };
        setSkills(newSkills);
        resetForm();
    };
    const handleRenameCategory = () => {
        const trimmedCategory = categoryTitle.trim();
        if(trimmedCategory === '' || trimmedCategory === editingCategory){
            resetForm();
            return;
        }
        const newSkills = {...skills};
        newSkills[trimmedCategory] = newSkills[editingCategory];
        delete newSkills[editingCategory];
        setSkills(newSkills);
        resetForm();
    };
    const handleSubmit = () => {
        if(editingCategory !== null) handleRenameCategory();
        else if(editingSkill !== null) handleModifySkill();
        else handleAdd();
    };
    const buttonLabel = editingCategory !== null ? "Rename category"
                       : editingSkill !== null ? "Modify skill"
                       : "Add skills";
    const buttonClass = (editingCategory !== null || editingSkill !== null) ? "editBtn" : "addBtn";
    return(
        <div className="technicalSkillInputs">
            <input type="text"
                   className="addSectionInput"
                   placeholder="Add title for a new category..."
                   value={categoryTitle}
                   onChange={(e)=>handleCategoryTitleChange(e.target.value)}
            />
            {editingCategory === null && (
                <>
                    {skillInputs.map((skillText,index) => (
                        <input key={index}
                               type="text"
                               className="addSkillInput"
                               placeholder="Add a name for the required skill..."
                               value={skillText}
                               onChange={(e)=>handleSkillInputChange(index,e.target.value)}
                        />
                    ))}
                    {editingSkill === null && skillInputs.length < 5 && (
                        <button className="addBtn" onClick={handleAddInputRow}>+</button>
                    )}
                </>
            )}
            <button className={buttonClass} onClick={handleSubmit}>
                {buttonLabel}
            </button>
        </div>
    );
}
function CategorySkillsAdder({category, skills, setSkills}){
    const [skillInputs, setSkillInputs] = useState(['']);
    const handleAddInputRow = () => {
        if(skillInputs.length < 5) setSkillInputs(prev => [...prev, '']);
    };
    const handleSkillInputChange = (index, value) => {
        setSkillInputs(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };
    const handleAddSkills = () => {
        const newSkillNames = skillInputs.map(s => s.trim()).filter(s => s !== '');
        if(newSkillNames.length === 0) return;
        const existing = skills[category] || [];
        setSkills({
            ...skills,
            [category]: [...existing, ...newSkillNames]
        });
        setSkillInputs(['']);
    };
    return (
        <div className="technicalSkillInputs">
            {skillInputs.map((skillText,index) => (
                <input key={index}
                       type="text"
                       className="addSkillInput"
                       placeholder="Add a skill to this category..."
                       value={skillText}
                       onChange={(e)=>handleSkillInputChange(index,e.target.value)}
                />
            ))}
            <div className="skillsInputRow">
                {skillInputs.length < 5 && (
                    <button className="addBtn" onClick={handleAddInputRow}>+</button>
                )}
                <button className="addBtn" onClick={handleAddSkills}>Add skills</button>
            </div>
        </div>
    );
}
function NeededSkills({skills,setSkills}){
    const [categoryTitle,setCategoryTitle] = useState('');
    const [skillInputs,setSkillInputs] = useState(['']);
    const [editingSkill,setEditingSkill] = useState(null);
    const [editingCategory,setEditingCategory] = useState(null);

    const deleteSkillSection = (category) => {
        const newSkills = {...skills};
        delete newSkills[category];
        setSkills(newSkills);
    };
    const deleteSkill = (category,skill) => {
        const newSkills = {
            ...skills,
            [category]: skills[category].filter(item=>item!==skill)
        };
        setSkills(newSkills);
    };
    const handleSkillEditClick = (category,skill) => {
        setCategoryTitle(category);
        setSkillInputs([skill]);
        setEditingSkill({category, oldSkillName:skill});
        setEditingCategory(null);
    };
    const handleCategoryEditClick = (category) => {
        setCategoryTitle(category);
        setSkillInputs(['']);
        setEditingCategory(category);
        setEditingSkill(null);
    };

    return (
        <div className="neededSkillsContainer">
        <h2 className="sectionHeading">Needed skills</h2>
        {
        Object.entries(skills || {})
        .map(([category,children])=>{
            return (
                <div key={category} className="profileSectionBox">
                    <span className="sectionTitleRow">
                        <h3 className="sectionTitle">{category}</h3>
                        <button className="editBtn"
                                onClick={()=>handleCategoryEditClick(category)}
                        >
                            ✎
                        </button>
                        <button className="deleteBtn"
                                onClick={()=>deleteSkillSection(category)}
                        >
                            X
                        </button>
                    </span>
                    <div className="skillsGrid">
                        {(children || []).map((item)=>(
                            <span key={item} className="skillBadge">
                                <span>{item}</span>
                                <button className="deleteBtn"
                                        onClick={()=>deleteSkill(category,item)}
                                >
                                    X
                                </button>
                                <button className="editBtn"
                                        onClick={()=>handleSkillEditClick(category,item)}
                                >
                                    ✎
                                </button>
                            </span>
                        ))}
                    </div>
                    <CategorySkillsAdder category={category} skills={skills} setSkills={setSkills}/>
                </div>
            )
        })
        }
        <NeededSkillsInput skills={skills}
                           setSkills={setSkills}
                           categoryTitle={categoryTitle}
                           setCategoryTitle={setCategoryTitle}
                           skillInputs={skillInputs}
                           setSkillInputs={setSkillInputs}
                           editingSkill={editingSkill}
                           setEditingSkill={setEditingSkill}
                           editingCategory={editingCategory}
                           setEditingCategory={setEditingCategory}
        />
        </div>
    );
}
function ProjectCreationPage(){
    const nav = useNavigate();

    const [name,setName] = useState('');
    const [description,setDescription] = useState('');
    const [githubRepos,setGithubRepos] = useState([]);
    const [neededSkills,setNeededSkills] = useState({});
    const [selectedRepoId,setSelectedRepoId] = useState(-1);//for repository modification

    const handleProjectCreation = async () => {
        const repoPayload = githubRepos.map(({id, ...rest}) => rest);
        const response = await createProject(name,description,neededSkills,repoPayload);
        if(typeof response === 'string' && response !== ''){
            nav(`/project-page/${response}`);
        }
    }
    return (
        <div id="projectCreationPage">
            <NavigationBar/>
            <div className="projectCreationForm">
                <input type="text"
                    className="projectNameInput"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    placeholder="Enter a name for the new project.The name must only contain capital letters,small letters and _ or - "
                />
                <textarea value={description}
                        className="sectionContentInput"
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
                <button className="addBtn" onClick={handleProjectCreation}>
                    Create project
                </button>
            </div>
        </div>
    );
}
export default ProjectCreationPage