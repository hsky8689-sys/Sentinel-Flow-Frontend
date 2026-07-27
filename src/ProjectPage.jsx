import { useState, useEffect } from "react";
import { NavigationBar } from "./ProfilePage";
import { useParams } from "react-router-dom";
import { loadProjectPage,
         requestProjectJoin,
         leaveProject } from "./utils/api-utlis";
import './assets/css/projectPage.css';
function SectionNavbar({setCurrentSection}){
    return(
        <nav id="projectNavbar">
            <button className="projectNavBtn"
                    onClick={()=>setCurrentSection("preview")}
            >
                Preview
            </button>
            <button className="projectNavBtn"
                    onClick={()=>setCurrentSection("main")}
            >
                Main page
            </button>
            <button className="projectNavBtn"
                    onClick={()=>setCurrentSection("settings")}
            >
                Settings
            </button>
            <button className="projectNavBtn"
                    onClick={()=>setCurrentSection("tasks")}
            >
                Tasks
            </button>
            <button className="projectNavBtn"
                    onClick={()=>setCurrentSection("roles")}
            >
                Roles
            </button>
            <button className="projectNavBtn"
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
function MembershipActions({role}){
    const [isMember,setIsMember] = useState(role);
    const requestProjectJoin = async () => {
        const response = await requestProjectJoin(data.project_id);
        if(response)setIsMember(false);
    }
    const leaveProject = async () => {
        const response = await leaveProject(data.project_id);
        if(response)setIsMember(false);
    };
    if(isMember){
        return (
            <div className="membershipActions">
                <button className="denyBtn" onClick={leaveProject}>
                    Leave project
                </button>
            </div>
        );
    }
    return (
        <div className="membershipActions">
            <button className="addBtn" onClick={requestProjectJoin}>
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
    const {project_name,description,role,requirements,domains} = data;
    return (
        <div id="previewLayout">
            <RequirementsPanel requirements={requirements}/>
            <div id="previewCentral">
                <ProjectHeader projectName={project_name}/>
                <MembershipActions role={role!=='visitor'}/>
                <p className="previewDescription">{description}</p>
            </div>
            <DomainsPanel domains={domains}/>
        </div>
    );
}
function MainPage(){
    //TODO
}
function Settings(){
    //TODO
}
function Tasks(){
    //TODO
}
function Roles(){
    //TODO
}
function GroupChat(){
    //TODO
}
function RenderCurrentSection({currentSection,data}){
    switch(currentSection){
        case 'preview':
            return <Preview data={data}/>
        case 'main':
            return <MainPage/>
        case 'settings':
            return <Settings/>
        case 'tasks':
            return <Tasks/>
        case 'roles':
            return <Roles/>
        case 'group_chat':
            return <GroupChat/>
        default:
            return <h1>Unknown section requested:{currentSection}</h1>
    }
}
function ProjectPage(){
    const {project} = useParams();
    const [data,setData] = useState(null);
    const [currentSection,setCurrentSection] = useState('preview');
    useEffect(() => {
        const fetchData = async () => {
            const stats = await loadProjectPage(project);
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
                <RenderCurrentSection currentSection={currentSection} data={data}/>
            </div>
        </div>
    </div>);
}
export default ProjectPage;