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
         getRolePermissions,
         runCode,
         getAvailableLanguages,
         getFileContent,
         requestFileAccess,
         pushFilesToGithub,
         deleteProjectRole,
         editProjectDetails,
         getProjectRequirements,
         addProjectSections,
         removeProjectSections,
         addProjectRequirements,
         removeProjectRequirements,
         getProjectDomains,
         addProjectDomains,
         removeProjectDomains,
         addProjectRepository,
         deleteProjectRepository,
         editProjectRepository,
         addProjectBranch,
         renameProjectBranch,
         deleteProjectBranch,
         mergeProjectBranches,
         inviteUserToProject,
         togglePushPolicy
          } from "./utils/api-utlis";
import './assets/css/projectPage.css';
import Editor from "@monaco-editor/react";
const JUDGE0_TO_MONACO_LANGUAGE = {
    'assembly': 'plaintext',
    'bash': 'shell',
    'basic': 'vb',
    'c': 'c',
    'c#': 'csharp',
    'c++': 'cpp',
    'clojure': 'clojure',
    'cobol': 'plaintext',
    'common lisp': 'plaintext',
    'd': 'plaintext',
    'elixir': 'elixir',
    'erlang': 'erlang',
    'executable': 'plaintext',
    'f#': 'fsharp',
    'fortran': 'fortran',
    'go': 'go',
    'groovy': 'groovy',
    'haskell': 'haskell',
    'java': 'java',
    'javascript': 'javascript',
    'kotlin': 'kotlin',
    'lua': 'lua',
    'multi-file program': 'plaintext',
    'objective-c': 'objective-c',
    'ocaml': 'plaintext',
    'octave': 'plaintext',
    'pascal': 'pascal',
    'perl': 'perl',
    'php': 'php',
    'plain text': 'plaintext',
    'prolog': 'plaintext',
    'python': 'python',
    'python for ml': 'python',
    'r': 'r',
    'ruby': 'ruby',
    'rust': 'rust',
    'scala': 'scala',
    'sql': 'sql',
    'swift': 'swift',
    'typescript': 'typescript',
    'visual basic.net': 'vb',
};
function mapLanguageNameToMonaco(name){
    if(!name) return 'plaintext';
    const firstWord = name.split('(')[0].trim().toLowerCase();
    if(JUDGE0_TO_MONACO_LANGUAGE[firstWord]) return JUDGE0_TO_MONACO_LANGUAGE[firstWord];
    return firstWord.replace(/[^a-z0-9]/g, '') || 'plaintext';
}
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
function MainPageFileBrowser({owner,repo,branch,onFileLoaded}){
    const [currentPath,setCurrentPath] = useState('');
    const [pathHistory,setPathHistory] = useState([]);
    const [items,setItems] = useState(null);
    const [loading,setLoading] = useState(false);

    useEffect(() => {
        setCurrentPath('');
        setPathHistory([]);
    }, [owner,repo,branch]);

    useEffect(() => {
        if(!owner || !repo || !branch) return;
        let cancelled = false;
        setLoading(true);
        fetchGithubStructure(owner,repo,currentPath,branch).then(result => {
            if(!cancelled){
                setItems(result);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [owner,repo,branch,currentPath]);

    const handleEnterFolder = (path) => {
        setPathHistory(prev => [...prev, currentPath]);
        setCurrentPath(path);
    };
    const handleFileClick = async (path) => {
        const data = await getFileContent(owner,repo,path,branch);
        onFileLoaded(path,data);
    };
    const handleGoBack = () => {
        setPathHistory(prev => {
            if(prev.length === 0) return prev;
            const updated = [...prev];
            const previousPath = updated.pop();
            setCurrentPath(previousPath);
            return updated;
        });
    };

    return (
        <div className="mainPageTreeBrowser">
            <div className="mainPageTreeHeader">
                <button type="button"
                        className="mainPageTreeBackBtn"
                        onClick={handleGoBack}
                        disabled={pathHistory.length === 0}
                >
                    ⬅ Back
                </button>
                <span className="mainPageTreeCurrentPath">{currentPath || '/'}</span>
            </div>
            {loading && <span className="githubTreeLoading">Loading...</span>}
            {items && items.map(item => (
                <div key={item.path}
                     className={`githubTreeItem ${item.type === 'dir' ? 'githubTreeDir' : 'githubTreeFile'}`}
                >
                    <span onClick={()=> item.type === 'dir' ? handleEnterFolder(item.path) : handleFileClick(item.path)}>
                        {item.type === 'dir' ? '📁 ' : '📄 '}{item.name}
                    </span>
                </div>
            ))}
        </div>
    );
}
function LanguageDropdown({languages,selectedLanguageId,setSelectedLanguageId}){
    const [isOpen,setIsOpen] = useState(false);
    const selectedLanguage = languages.find(l => String(l.id) === String(selectedLanguageId));

    const handleSelect = (id) => {
        setSelectedLanguageId(id);
        setIsOpen(false);
    };

    return (
        <div className="languageDropdown">
            <button type="button"
                    className="languageDropdownToggle"
                    onClick={()=>setIsOpen(prev => !prev)}
            >
                {selectedLanguage ? selectedLanguage.name : 'Select a language...'}
            </button>
            {isOpen && (
                <div className="languageDropdownList">
                    {languages.map(lang => (
                        <div key={lang.id}
                             className="languageDropdownItem"
                             onClick={()=>handleSelect(lang.id)}
                        >
                            {lang.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
function MainPage({tasks,data}){
    const [selectedRepoId,setSelectedRepoId] = useState('');
    const [branches,setBranches] = useState([]);
    const [selectedBranch,setSelectedBranch] = useState('');
    const [languages,setLanguages] = useState([]);
    const [selectedLanguageId,setSelectedLanguageId] = useState('');
    const [code,setCode] = useState('');
    const [selectedFilePath,setSelectedFilePath] = useState('');
    const [runOutput,setRunOutput] = useState(null);
    const [selectedTaskId,setSelectedTaskId] = useState('');
    const [originalContents,setOriginalContents] = useState({});
    const [flaggedForPush,setFlaggedForPush] = useState({});
    const [showPushModal,setShowPushModal] = useState(false);
    const [pushMessage,setPushMessage] = useState('');

    const hasFileAccess = selectedFilePath
        ? data?.files_permissions?.[selectedFilePath] === 'ACCESS'
        : true;

    useEffect(() => {
        if(tasks && tasks.length > 0 && !selectedTaskId){
            setSelectedTaskId(tasks[0].id);
        }
    }, [tasks]);

    const selectedLanguageObj = (Array.isArray(languages)?languages:Object.entries(languages))
        .find(l => String(l.id) === String(selectedLanguageId));
    const selectedLanguageName = mapLanguageNameToMonaco(selectedLanguageObj?.name);

    useEffect(() => {
        const fetchLanguages = async () => {
            const result = await getAvailableLanguages();
            const receivedLanguages = Object.values(result.languages);
            setLanguages(receivedLanguages);
        };
        fetchLanguages();
    }, []);

    const repos = data?.repos || [];
    const selectedRepo = repos.find(r => String(r.id) === String(selectedRepoId)) || null;

    useEffect(() => {
        if(!selectedRepo){
            setBranches([]);
            setSelectedBranch('');
            return;
        }
        let cancelled = false;
        fetchRepoBranches(data?.project_name,selectedRepo.id).then(result => {
            if(!cancelled){
                setBranches(result);
                setSelectedBranch(result.length > 0 ? result[0] : '');
            }
        });
        return () => { cancelled = true; };
    }, [selectedRepo?.id]);
    
    const handleFileLoaded = (path,fileData) => {
        setSelectedFilePath(path);
        const content = fileData?.decodedContent ?? fileData?.content ?? '';
        setCode(content);
        setOriginalContents(prev => ({...prev, [path]: content}));
    };
    const handleCodeChange = (value) => {
        const newValue = value ?? '';
        setCode(newValue);
        if(!selectedFilePath) return;
        const original = originalContents[selectedFilePath];
        setFlaggedForPush(prev => {
            const updated = {...prev};
            if(newValue !== original){
                updated[selectedFilePath] = newValue;
            }else{
                delete updated[selectedFilePath];
            }
            return updated;
        });
    };
    const handleRemoveFlaggedFile = (path) => {
        setFlaggedForPush(prev => {
            const updated = {...prev};
            delete updated[path];
            return updated;
        });
    };
    const handlePushToGithub = async () => {
        if(!selectedRepo) return;
        const response = await pushFilesToGithub(data?.project_id,selectedRepo.owner,selectedRepo.repo,selectedBranch,flaggedForPush,pushMessage);
        if(response){
            setFlaggedForPush({});
            setPushMessage('');
            setShowPushModal(false);
        }
    };

    const handleRunCode = async () => {
        const result = await runCode(data?.project_name,code,Number(selectedLanguageId) || 71);
        setRunOutput(result);
    };
    const handleRequestFileAccess = async () => {
        await requestFileAccess(data?.project_id,[selectedFilePath],selectedTaskId || null);
    };

    return (
        <div id="mainPageContainer">
            <div id="mainPageLeft">
                <select className="sectionSelect"
                        value={selectedRepoId}
                        onChange={(e)=>setSelectedRepoId(e.target.value)}
                >
                    <option value="">Select a repository...</option>
                    {repos.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                <select className="sectionSelect"
                        value={selectedBranch}
                        onChange={(e)=>setSelectedBranch(e.target.value)}
                        disabled={branches.length === 0}
                >
                    {branches.length === 0 && <option value="">No branches</option>}
                    {branches.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
                {selectedRepo && selectedBranch && (
                    <MainPageFileBrowser owner={selectedRepo.owner}
                                         repo={selectedRepo.repo}
                                         branch={selectedBranch}
                                         onFileLoaded={handleFileLoaded}/>
                )}
            </div>
            <div id="mainPageCenter">
                <LanguageDropdown languages={Array.isArray(languages)?languages:Object.entries(languages)}
                                  selectedLanguageId={selectedLanguageId}
                                  setSelectedLanguageId={setSelectedLanguageId}
                />
                <div className="codeEditorWrapper">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        language={selectedLanguageName}
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false
                        }}
                    />
                </div>
                                <div className="codeEditorActions">
                    <button type="button" className="addBtn" onClick={handleRunCode}>
                        Run code
                    </button>
                    {Object.keys(flaggedForPush).length > 0 && (
                        <button type="button" className="addBtn" onClick={()=>setShowPushModal(true)}>
                            Push changes ({Object.keys(flaggedForPush).length})
                        </button>
                    )}
                    {!hasFileAccess && selectedFilePath && (
                        <>
                            <select className="sectionSelect"
                                    value={selectedTaskId}
                                    onChange={(e)=>setSelectedTaskId(e.target.value)}
                            >
                                <option value="">Select a task...</option>
                                {(tasks || []).map(task => (
                                    <option key={task.id} value={task.id}>{task.name}</option>
                                ))}
                            </select>
                            <button type="button" className="denyBtn" onClick={handleRequestFileAccess}>
                                Request file access
                            </button>
                        </>
                    )}
                </div>
                {showPushModal && (
                    <div className="modalOverlay" onClick={()=>setShowPushModal(false)}>
                        <div className="modalBox pushModalBox" onClick={(e)=>e.stopPropagation()}>
                            <button type="button" className="modalCloseBtn" onClick={()=>setShowPushModal(false)}>X</button>
                            <input type="text"
                                   className="addSectionInput"
                                   placeholder="Push message..."
                                   value={pushMessage}
                                   onChange={(e)=>setPushMessage(e.target.value)}
                            />
                            <div className="pushFilesList">
                                {Object.keys(flaggedForPush).map(path => (
                                    <div key={path} className="pushFileItem">
                                        <span>{path}</span>
                                        <button type="button" className="deleteBtn" onClick={()=>handleRemoveFlaggedFile(path)}>X</button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="addBtn" onClick={handlePushToGithub}>
                                Push to GitHub
                            </button>
                        </div>
                    </div>
                )}
                <div className="codeRunOutput">
                    {runOutput && (
                        <>
                            {runOutput.status?.description && (
                                <div className="codeOutputStatus">Status: {runOutput.status.description}</div>
                            )}
                            {runOutput.stdout && (
                                <div className="codeOutputBlock">
                                    <span className="codeOutputLabel">Output:</span>
                                    <pre className="codeOutputContent">{runOutput.stdout}</pre>
                                </div>
                            )}
                            {runOutput.stderr && (
                                <div className="codeOutputBlock">
                                    <span className="codeOutputLabel">Error:</span>
                                    <pre className="codeOutputContent codeOutputError">{runOutput.stderr}</pre>
                                </div>
                            )}
                            {runOutput.compile_output && (
                                <div className="codeOutputBlock">
                                    <span className="codeOutputLabel">Compile output:</span>
                                    <pre className="codeOutputContent codeOutputError">{runOutput.compile_output}</pre>
                                </div>
                            )}
                            {!runOutput.stdout && !runOutput.stderr && !runOutput.compile_output && (
                                <pre className="codeOutputContent">{JSON.stringify(runOutput, null, 2)}</pre>
                            )}
                        </>
                    )}
                </div>
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
function RequirementsSettings({data,setData}){
    const projectId = data?.project_id;
    const requirements = data?.requirements || {};
    const sectionNames = Object.keys(requirements);

    const [selectedSection,setSelectedSection] = useState(sectionNames[0] || '');
    const [sectionTitle,setSectionTitle] = useState(sectionNames[0] || '');
    const [addNewSection,setAddNewSection] = useState(false);
    const [skills,setSkills] = useState(['']);

    const refreshRequirements = async () => {
        const response = await getProjectRequirements(projectId);
        if(response && response.status === 'succes'){
            setData(prev => ({...prev, requirements: response.requirements}));
        }
    };

    const handleDeleteSkill = async (sectionName,skillName) => {
        const response = await removeProjectRequirements(projectId,[[sectionName,skillName]]);
        if(response && response.status === 'success'){
            refreshRequirements();
        }
    };

    const handleDeleteSection = async (sectionName) => {
        const response = await removeProjectSections(projectId,[sectionName]);
        if(response && response.status === 'succes'){
            refreshRequirements();
        }
    };

    const handleInputChange = (index,value) => {
        setSkills(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleAddInput = () => {
        if(skills.length < 5) setSkills(prev => [...prev,'']);
    };

    const handleConfirm = async () => {
        const filledSkills = skills.filter(s=>s.trim() !== '');
        if(filledSkills.length === 0 || sectionTitle.trim() === '') return;
        let response;
        if(addNewSection){
            response = await addProjectSections(projectId,[sectionTitle]);
            if(response && response.status === 'succes'){
                response = await addProjectRequirements(projectId,filledSkills.map(s=>[sectionTitle,s]));
            }
        }else{
            response = await addProjectRequirements(projectId,filledSkills.map(s=>[selectedSection,s]));
        }
        if(response && response.status === 'success'){
            setSkills(['']);
            setAddNewSection(false);
            refreshRequirements();
        }
    };

    return (
        <div className="profileSectionBox">
            <h3 className="sectionTitle">Required skills</h3>
            {Object.entries(requirements).map(([sectionName,skillsList]) => (
                <div key={sectionName} className="techSectionBox">
                    <span className="sectionTitleRow">
                        <h3 className="sectionTitle">{sectionName}</h3>
                        <button className="deleteBtn" onClick={()=>handleDeleteSection(sectionName)}>X</button>
                    </span>
                    <div className="skillsGrid">
                        {(skillsList || []).map((skill,index) => {
                            const skillName = typeof skill === 'string' ? skill : skill.skill;
                            return (
                                <span key={skill.id ?? index} className="skillBadge">
                                    <span>{skillName}</span>
                                    <button className="deleteBtn" onClick={()=>handleDeleteSkill(sectionName,skillName)}>X</button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            ))}
            <div className="techStackActions">
                <select className="sectionSelect"
                        value={selectedSection}
                        onChange={(e)=>{
                            setAddNewSection(false);
                            setSelectedSection(e.target.value);
                            setSectionTitle(e.target.value);
                        }}
                >
                    {sectionNames.map(name=>(
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
                <div className="technicalSkillInputs">
                    <input type="text"
                           placeholder="add new section..."
                           className="addSectionInput"
                           value={sectionTitle}
                           onKeyDown={()=>setAddNewSection(true)}
                           onChange={(e)=>setSectionTitle(e.target.value)}
                    />
                    {skills.map((skillText,index)=>(
                        <input key={index}
                               type="text"
                               placeholder="add new skill to section"
                               className="addSkillInput"
                               value={skillText}
                               onChange={(e)=>handleInputChange(index,e.target.value)}
                        />
                    ))}
                    <span className="techActionButtons">
                        {skills.length < 5 && (
                            <button className="addBtn" onClick={handleAddInput}>+</button>
                        )}
                        <button className="addBtn" onClick={handleConfirm}>Confirm changes</button>
                    </span>
                </div>
            </div>
        </div>
    );
}
function DomainsSettings({data,setData}){
    const projectId = data?.project_id;
    const domains = data?.domains || [];
    const [newDomains,setNewDomains] = useState(['']);

    const refreshDomains = async () => {
        const response = await getProjectDomains(projectId);
        if(response && response.status === 'success'){
            setData(prev => ({...prev, domains: response.domains}));
        }
    };

    const handleDeleteDomain = async (domainName) => {
        const response = await removeProjectDomains(projectId,[domainName]);
        if(response && response.status === 'succes'){
            refreshDomains();
        }
    };

    const handleInputChange = (index,value) => {
        setNewDomains(prev => {
            const updated = [...prev];
            updated[index] = value;
            return updated;
        });
    };

    const handleAddInput = () => {
        if(newDomains.length < 5) setNewDomains(prev => [...prev,'']);
    };

    const handleConfirm = async () => {
        const filled = newDomains.filter(d=>d.trim() !== '');
        if(filled.length === 0) return;
        const response = await addProjectDomains(projectId,filled);
        if(response && response.status === 'succes'){
            setNewDomains(['']);
            refreshDomains();
        }
    };

    return (
        <div className="profileSectionBox">
            <h3 className="sectionTitle">Project domains</h3>
            <div className="skillsGrid">
                {domains.map((d,index)=>(
                    <span key={d.id ?? index} className="skillBadge">
                        <span>{d.domain}</span>
                        <button className="deleteBtn" onClick={()=>handleDeleteDomain(d.domain)}>X</button>
                    </span>
                ))}
            </div>
            <div className="technicalSkillInputs">
                {newDomains.map((domainText,index)=>(
                    <input key={index}
                           type="text"
                           placeholder="add new domain..."
                           className="addSkillInput"
                           value={domainText}
                           onChange={(e)=>handleInputChange(index,e.target.value)}
                    />
                ))}
                <span className="techActionButtons">
                    {newDomains.length < 5 && (
                        <button className="addBtn" onClick={handleAddInput}>+</button>
                    )}
                    <button className="addBtn" onClick={handleConfirm}>Confirm changes</button>
                </span>
            </div>
        </div>
    );
}
function RepoSettings({data,setData}){
    const projectId = data?.project_id;
    const projectName = data?.project_name;
    const repos = data?.repos || [];
    const [editingRepoId,setEditingRepoId] = useState(null);
    const [repoName,setRepoName] = useState('');
    const [repoLink,setRepoLink] = useState('');
    const [repoToken,setRepoToken] = useState('');

    const refreshData = async () => {
        const fresh = await loadProjectPage(projectName);
        if(fresh){
            setData(fresh);
        }
    };

    const resetForm = () => {
        setEditingRepoId(null);
        setRepoName('');
        setRepoLink('');
        setRepoToken('');
    };

    const handleEditClick = (repoItem) => {
        setEditingRepoId(repoItem.id);
        setRepoName(repoItem.name);
        setRepoLink(repoItem.owner && repoItem.repo ? `https://github.com/${repoItem.owner}/${repoItem.repo}` : '');
        setRepoToken('');
    };

    const handleAddRepo = async () => {
        if(repoName.trim() === '' || repoLink.trim() === '') return;
        const response = await addProjectRepository(projectId,repoName.trim(),repoLink.trim(),repoToken.trim());
        if(response && response.status === 'success'){
            resetForm();
            refreshData();
        }
    };

    const handleModifyRepo = async () => {
        const updates = {};
        if(repoName.trim() !== '') updates.github_repo_name = repoName.trim();
        if(repoLink.trim() !== '') updates.github_repo_link = repoLink.trim();
        if(repoToken.trim() !== '') updates.github_token = repoToken.trim();
        if(Object.keys(updates).length === 0) return;
        const response = await editProjectRepository(projectId,editingRepoId,updates);
        if(response && response.status === 'success'){
            resetForm();
            refreshData();
        }
    };

    const handleDeleteRepo = async (repoId) => {
        const response = await deleteProjectRepository(projectId,repoId);
        if(response && response.status === 'success'){
            if(editingRepoId === repoId) resetForm();
            refreshData();
        }
    };

    return (
        <div className="profileSectionBox">
            <h3 className="sectionTitle">GitHub repositories</h3>
            <div className="skillsGrid">
                {repos.map(repoItem=>(
                    <span key={repoItem.id} className="skillBadge">
                        <span>{repoItem.name} ({repoItem.owner}/{repoItem.repo})</span>
                        <button className="editBtn" onClick={()=>handleEditClick(repoItem)}>Modify</button>
                        <button className="deleteBtn" onClick={()=>handleDeleteRepo(repoItem.id)}>X</button>
                    </span>
                ))}
            </div>
            <div className="technicalSkillInputs">
                <input type="text"
                       placeholder="Repo name..."
                       className="addSectionInput"
                       value={repoName}
                       onChange={(e)=>setRepoName(e.target.value)}
                />
                <input type="text"
                       placeholder="Repo link (https://github.com/owner/repo)..."
                       className="addSkillInput"
                       value={repoLink}
                       onChange={(e)=>setRepoLink(e.target.value)}
                />
                <input type="text"
                       placeholder={editingRepoId === null ? "Access token (optional)..." : "New access token (leave blank to keep current)..."}
                       className="addSkillInput"
                       value={repoToken}
                       onChange={(e)=>setRepoToken(e.target.value)}
                />
                <button className={editingRepoId === null ? "addBtn" : "editSubmitBtn"}
                        onClick={editingRepoId === null ? handleAddRepo : handleModifyRepo}
                >
                    {editingRepoId === null ? "Add repository" : "Modify repository"}
                </button>
            </div>
        </div>
    );
}
function BranchSettings({data}){
    const projectId = data?.project_id;
    const projectName = data?.project_name;
    const repos = data?.repos || [];
    const [selectedRepoId,setSelectedRepoId] = useState('');
    const [branches,setBranches] = useState([]);
    const [baseBranch,setBaseBranch] = useState('');
    const [headBranch,setHeadBranch] = useState('');
    const [newBranchName,setNewBranchName] = useState('');
    const [renameTarget,setRenameTarget] = useState('');

    const selectedRepo = repos.find(r => String(r.id) === String(selectedRepoId)) || null;

    const refreshBranches = async () => {
        if(!selectedRepo) return;
        const result = await fetchRepoBranches(projectName,selectedRepo.id);
        setBranches(result);
        setBaseBranch(result.length > 0 ? result[0] : '');
        setHeadBranch(result.length > 0 ? result[0] : '');
    };

    useEffect(() => {
        if(!selectedRepo){
            setBranches([]);
            setBaseBranch('');
            setHeadBranch('');
            return;
        }
        let cancelled = false;
        fetchRepoBranches(projectName,selectedRepo.id).then(result => {
            if(!cancelled){
                setBranches(result);
                setBaseBranch(result.length > 0 ? result[0] : '');
                setHeadBranch(result.length > 0 ? result[0] : '');
            }
        });
        return () => { cancelled = true; };
    }, [selectedRepo?.id]);

    const handleMerge = async () => {
        if(!baseBranch || !headBranch || !selectedRepo) return;
        const response = await mergeProjectBranches(projectId,baseBranch,headBranch,selectedRepo.id);
        if(response && response.status === 'success'){
            refreshBranches();
        }
    };

    const handleAddBranch = async () => {
        if(!selectedRepo || newBranchName.trim() === '') return;
        const response = await addProjectBranch(projectId,newBranchName.trim(),selectedRepo.id);
        if(response && response.status === 'success'){
            setNewBranchName('');
            refreshBranches();
        }
    };

    const handleRenameBranch = async () => {
        if(!selectedRepo || !baseBranch || renameTarget.trim() === '') return;
        const response = await renameProjectBranch(projectId,baseBranch,renameTarget.trim(),selectedRepo.id);
        if(response && response.status === 'success'){
            setRenameTarget('');
            refreshBranches();
        }
    };

    const handleDeleteBranch = async () => {
        if(!selectedRepo || !baseBranch) return;
        const response = await deleteProjectBranch(projectId,baseBranch,selectedRepo.id);
        if(response && response.status === 'success'){
            refreshBranches();
        }
    };

    return (
        <div className="profileSectionBox">
            <h3 className="sectionTitle">Branches</h3>
            <select className="sectionSelect"
                    value={selectedRepoId}
                    onChange={(e)=>setSelectedRepoId(e.target.value)}
            >
                <option value="">Select a repository...</option>
                {repos.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                ))}
            </select>
            <div className="branchMergeRow">
                <div className="branchMergeColumn">
                    <span className="sectionTitle">Base</span>
                    <select className="sectionSelect"
                            value={baseBranch}
                            onChange={(e)=>setBaseBranch(e.target.value)}
                            disabled={branches.length === 0}
                    >
                        {branches.length === 0 && <option value="">No branches</option>}
                        {branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
                <div className="branchMergeColumn">
                    <span className="sectionTitle">Head</span>
                    <select className="sectionSelect"
                            value={headBranch}
                            onChange={(e)=>setHeadBranch(e.target.value)}
                            disabled={branches.length === 0}
                    >
                        {branches.length === 0 && <option value="">No branches</option>}
                        {branches.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
            </div>
            <button type="button" className="addBtn" onClick={handleMerge}>Merge</button>

            <div className="technicalSkillInputs">
                <input type="text"
                       placeholder="New branch name..."
                       className="addSectionInput"
                       value={newBranchName}
                       onChange={(e)=>setNewBranchName(e.target.value)}
                />
                <button type="button" className="addBtn" onClick={handleAddBranch}>Add branch</button>
            </div>

            <div className="technicalSkillInputs">
                <input type="text"
                       placeholder={`Rename "${baseBranch || '...'}" to...`}
                       className="addSectionInput"
                       value={renameTarget}
                       onChange={(e)=>setRenameTarget(e.target.value)}
                />
                <button type="button" className="editSubmitBtn" onClick={handleRenameBranch}>Rename base branch</button>
                <button type="button" className="denyBtn" onClick={handleDeleteBranch}>Delete base branch</button>
            </div>
        </div>
    );
}
function MembersSettings({data,setData}){
    const projectId = data?.project_id;
    const projectName = data?.project_name;
    const staff = data?.staff || {};
    const allMembers = Object.values(staff).flat();
    const [inviteUsername,setInviteUsername] = useState('');

    const handleRemoveUser = async (username) => {
        const response = await kickUsersFromProject(projectId,[username]);
        if(response){
            const fresh = await loadProjectPage(projectName);
            if(fresh) setData(fresh);
        }
    };

    const handleInviteUser = async () => {
        if(inviteUsername.trim() === '') return;
        const response = await inviteUserToProject(projectId,inviteUsername.trim());
        if(response){
            setInviteUsername('');
        }
    };

    return (
        <div className="profileSectionBox">
            <h3 className="sectionTitle">Project members</h3>
            <div className="skillsGrid">
                {allMembers.map(u=>(
                    <span key={u.id} className="skillBadge">
                        <span>{u.username}</span>
                        <button className="deleteBtn" onClick={()=>handleRemoveUser(u.username)}>X</button>
                    </span>
                ))}
            </div>
            <div className="technicalSkillInputs">
                <input type="text"
                       placeholder="Search new user to invite..."
                       className="addSectionInput"
                       value={inviteUsername}
                       onChange={(e)=>setInviteUsername(e.target.value)}
                />
                <button type="button" className="addBtn" onClick={handleInviteUser}>Invite</button>
            </div>
        </div>
    );
}
function PushPolicySettings({data,setData}){
    const projectId = data?.project_id;
    const enabled = !!data?.can_only_modify_from_app;

    const handleToggle = async () => {
        const response = await togglePushPolicy(projectId,!enabled);
        if(response){
            setData(prev => ({...prev, can_only_modify_from_app: !enabled}));
        }
    };

    return (
        <div className="profileSectionBox">
            <h3 className="sectionTitle">Push policy</h3>
            <p className="sectionContent">Adds a webhook to all the associated github repositories which triggers the in-app verification of all detected push attempts and automatically rejects all pushes with a different access token than the one registered by the app.Note that the account which has generated that token can still push from outside the app.Changes may be reverted</p>
            <label className="rolePermissionLabel"></label>
            <label className="rolePermissionLabel">
                <input type="checkbox" checked={enabled} onChange={handleToggle}/>
                Can only modify from app
            </label>
        </div>
    );
}
function Settings({data,setData}){
    const [name,setName] = useState(data?.project_name || '');
    const [description,setDescription] = useState(data?.description || '');

    const handleSaveDetails = async () => {
        const response = await editProjectDetails(data.project_id,{name,description});
        if(response && response.status === 'success'){
            setData(prev => ({...prev, project_name: response.name, description: response.description}));
        }
    };

    return (
        <div id="settingsContainer">
            <div className="profileSectionBox">
                <h3 className="sectionTitle">Project details</h3>
                <input type="text"
                       className="addSectionInput"
                       placeholder="Project name..."
                       value={name}
                       onChange={(e)=>setName(e.target.value)}
                />
                <textarea className="sectionContentInput"
                          placeholder="Project description..."
                          value={description}
                          onChange={(e)=>setDescription(e.target.value)}
                />
                <button type="button" className="editSubmitBtn" onClick={handleSaveDetails}>
                    Save
                </button>
                <RequirementsSettings data={data} setData={setData}/>
                <DomainsSettings data={data} setData={setData}/>
                <RepoSettings data={data} setData={setData}/>
                <BranchSettings data={data}/>
                <MembersSettings data={data} setData={setData}/>
                <PushPolicySettings data={data} setData={setData}/>
            </div>
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
                                                    'title':name.trim(),
                                                    'description':description,
                                                    'start_date':startDate,
                                                    'end_date':endDate,
                                                    'usernames':usernames,
                                                    'resource_paths':resourcePaths
                                                 });
        if(response && response.status === 'success'){
            setTasks(prev => prev.map(t => t.id === editingTaskId
                ? {...t,
                name: name.trim(),
                description,
                start_date: startDate,
                end_date: endDate,
                finished,
                usernames: response.affiliated_users,
                repos,
                resource_paths: response.resource_paths}
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
function RoleSection({roleId,roleName,users,projectId,onEditClick,onDeleteClick}){
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
            <button type="button"
                    className="editBtn"
                    onClick={()=>onEditClick(roleId,roleName,permissions?.permissions,users)}
            >
                Modify
            </button>
            <button type="button"
                    className="deleteBtn"
                    onClick={()=>onDeleteClick(roleId,roleName)}
            >
                Delete
            </button>
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
                        <input type="checkbox" checked={!!value} disabled readOnly/>
                        {key}
                    </label>
                ))}
            </div>
        </div>
    );
}
function NewRoleForm({permissionKeys,
                      projectUsers,
                      projectId,
                      editingRoleId,
                      setEditingRoleId,
                      roleName,
                      setRoleName,
                      selectedPermissions,
                      setSelectedPermissions,
                      selectedUsers,
                      setSelectedUsers}){
    const togglePermission = (key) => {
        setSelectedPermissions(prev => ({...prev, [key]: !prev[key]}));
    };
    const addUser = (username) => {
        if(username && !selectedUsers.includes(username)) setSelectedUsers(prev => [...prev, username]);
    };
    const removeUser = (username) => {
        setSelectedUsers(prev => prev.filter(u => u !== username));
    };
    const resetForm = () => {
        setEditingRoleId(null);
        setRoleName('');
        setSelectedPermissions({});
        setSelectedUsers([]);
    };
    const handleRoleNameChange = (value) => {
        setRoleName(value);
        setEditingRoleId(null);
    };
    const handleCreateRole = () => {
        if(roleName.trim() === '') return;
        
    };
    const handleModifyRole = async () => {
        if(roleName.trim() === '') return;
        if(!editingRoleId){
            console.error('editingRoleId is missing - roleIds[roleName] lookup likely failed, check name mismatch between staff and role_ids from backend');
            return;
        }
        const response = await editProjectRole(projectId,editingRoleId,{
            name: roleName.trim(),
            ...selectedPermissions
        });
        if(response){
            resetForm();
        }
    }

    return (
        <div className="technicalSkillInputs">
            <input type="text"
                   className="addSectionInput"
                   placeholder="Role name..."
                   value={roleName}
                   onChange={(e)=>handleRoleNameChange(e.target.value)}
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
            <button type="button"
                    className={editingRoleId === null ? "addBtn" : "editSubmitBtn"}
                    onClick={editingRoleId === null ? handleCreateRole : handleModifyRole}
            >
                {editingRoleId === null ? "Create role" : "Modify role"}
            </button>
        </div>
    );
}
function Roles({data,setData}){
    if(!data) return null;
    const staff = data.staff || {};
    const roleIds = data.role_ids || {};
    const permissionKeys = Object.keys(data.visitor_permissions || {});
    const projectUsers = Object.values(staff).flat().map(u=>u.username);

    const [editingRoleId,setEditingRoleId] = useState(null);
    const [roleName,setRoleName] = useState('');
    const [selectedPermissions,setSelectedPermissions] = useState({});
    const [selectedUsers,setSelectedUsers] = useState([]);

    const handleEditClick = (roleId,currentName,currentPermissions,currentUsers) => {
        setEditingRoleId(roleId);
        setRoleName(currentName);
        setSelectedPermissions(currentPermissions || {});
        setSelectedUsers((currentUsers || []).map(u=>u.username));
    };

    const handleDeleteClick = async (roleId,roleNameToDelete) => {
        const response = await deleteProjectRole(data.project_id,roleId);
        if(response && response.status === 'success'){
            const demotedIds = response.demoted_to_viewer || [];
            const deletedRoleUsers = (staff[roleNameToDelete] || []).filter(u=>demotedIds.includes(u.id));
            setData(prev => {
                const newStaff = {...prev.staff};
                delete newStaff[roleNameToDelete];
                newStaff.viewer = [...(newStaff.viewer || []), ...deletedRoleUsers];
                const newRoleIds = {...prev.role_ids};
                delete newRoleIds[roleNameToDelete];
                return {...prev, staff: newStaff, role_ids: newRoleIds};
            });
            if(editingRoleId === roleId){
                setEditingRoleId(null);
                setRoleName('');
                setSelectedPermissions({});
                setSelectedUsers([]);
            }
        }
    };

    return (
        <div id="rolesContainer">
            {Object.entries(staff).map(([roleNameKey,users])=>(
                <RoleSection key={roleNameKey}
                             roleId={roleIds[roleNameKey]}
                             roleName={roleNameKey}
                             users={users}
                             projectId={data.project_id}
                             onEditClick={handleEditClick}
                             onDeleteClick={handleDeleteClick}
                />
            ))}
            <NewRoleForm permissionKeys={permissionKeys}
                         projectUsers={projectUsers}
                         projectId={data.project_id}
                         editingRoleId={editingRoleId}
                         setEditingRoleId={setEditingRoleId}
                         roleName={roleName}
                         setRoleName={setRoleName}
                         selectedPermissions={selectedPermissions}
                         setSelectedPermissions={setSelectedPermissions}
                         selectedUsers={selectedUsers}
                         setSelectedUsers={setSelectedUsers}
            />
        </div>
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
                               setData,
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
            return <MainPage tasks={tasks} data={data}/>
        case 'settings':
            return <Settings data={data} setData={setData}/>
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
            return <Roles data={data} setData={setData}/>
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
            setData(stats);
        };
        fetchData();
    }, [project]);
    console.log(JSON.stringify(data));
    return (
    <div id="mainProjectPageDiv">
        <NavigationBar/>
        <div className="mainProjectContent">
            <SectionNavbar setCurrentSection={setCurrentSection}/>
            <div className="mainProjectContent">
                                <RenderCurrentSection currentSection={currentSection}
                                      data={data} setData={setData} tasks={tasks} 
                                      setTasks={setTasks} setTasks={setTasks}
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