import {useEffect, useState} from 'react'
import './assets/css/ProfilePage.css'
import { useParams,useNavigate,Link } from 'react-router-dom';
import { accesProfilePage,
         deleteSkill,
         addTechStackSection,
         addSkillToSection,
         deleteTechStackSection,
         addProfileSection,
         modifyProfileSection,
         deleteProfileSection } from './utils/api-utlis';
import { useRef } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL;
function TechnicalSkillInput({isOwner,modifyChanges,title,modifyTitle,addNew,setAddNew}){
  if (isOwner === false)return null;
  const [buttonAction, setButtonAction] = useState('add');
  const bottomRef = useRef(null);
  const [skills,setSkills] = useState([""]);
  const hasPageBeenRendered = useState(false);
  const handleAddInput = () => {
    if(skills.length < 5)setSkills(prevSkills => [...prevSkills,""]);
  };
  const handleInputChange = (index,value) => {
      setSkills(prevSkills=>{
        const updated = [...prevSkills];
        updated[index] = value;
        return updated;
      });
  };
  const handleConfirm = () => {
    const filledSkills = skills.filter(skill=>skill.trim()!=='');
    if(addNew){
      const newAdded = (async () => {
        const response =  await addTechStackSection(title,skills);
        return response;
      })();
      console.log(newAdded);
      if(newAdded){
        setSkills([""]);
        
      }
    }
    else{
      const len = skills.length;
      let added = 0;
      filledSkills.forEach((skill)=>{
        const newAdded = (async () => {
        const response =  await addSkillToSection(title,skill);
        added += newAdded ? 1 : 0;
        return response;
      })();
      })
      if(added === len){
        setSkills([""]);
      }
    }
  };
  useEffect(() => {
    if(hasPageBeenRendered.current){
      bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }else hasPageBeenRendered.current = true;
  }, [skills]);
  return (
      <div className='technicalSkillInputs'>
          <input type="text" 
                 placeholder="add new section..." className="addSectionInput" 
                 value={title}
                 onKeyDown={()=>{setAddNew(true);}}
                 onChange={(e)=>modifyTitle(e.target.value)}
          />
          {skills.map((skillText,index) => (
              <input key={index}
                     type="text"
                     placeholder='add new skill to section'
                     className='addSkillInput'
                     value={skillText}
                     onChange={(e)=>handleInputChange(index,e.target.value)}
              />
          ))
          }
          <span ref={bottomRef}>
            {skills.length < 5 && (
                <button className='addBtn' onClick={handleAddInput}>+</button>
            )}
            <button className='addBtn' onClick={handleConfirm}>Confirm changes</button>
        </span>
      </div>
  );
}
function FriendshipStatusButton({userData}){
  /*
  Displays => the Send request button if an user enters a non friend's page,
              with no active requests between the 2
           => the Delete friend button if an user enters a friend's page
           => the Accept/Deny request if an user enters the page of sb who sent him a request
           => the Cancel request if an user enters the page of sb with a pending request
           => nothing if he enters his own page
  */
  if(userData === null){
    return;
  }
  const sentToHim = userData.sent_to_him;
  const isPageOwner = userData.is_owner;
  const receivedFromHim = userData.recieved_from_him;
  if(isPageOwner){
    return;
  }
  else if(sentToHim){
    return (<button onClick={null}>Cancel request</button>);
  }
  else if(receivedFromHim){
    return (<div className='acceptOrDenyRequest'>
              <button id='acceptBtn' onClick={null}>
                Accept
              </button>
              <button type={"button"}
                   onClick={null}
              >
                Deny
              </button>
            </div>);
  }
  else{
    return (<div>
                <button id='sendBtn'>Send friend request</button>
            </div>);
  }
  return;
}
function makeBgStyle({backgroundImageUrl}){
  return {
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'};
}
function UpperContainer({data}){
  const bgUrl = data.background_picture;
  const url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop';
  const {username} = useParams();
  return (
        <div id={"backgroundPicture"} style={makeBgStyle({backgroundImageUrl:url})}>
                <div id={"pfp"}>
                    <img src={bgUrl} 
                        alt={"poza profil"}>
                    </img>
                </div>
                <h1 id='usernameHeader'>{username}</h1>
                <FriendshipStatusButton userData={data}/>
                <button id='chatBtn'>Message user</button>
        </div>
  );
}
function UserTechStack({ data, isOwner }) {
  const [selectedSection, setSelectedSection] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [addNew,setAddNew] = useState(false);
  const handleSkillDeletion = async (skillId) => {
    const response = await deleteSkill(skillId);
    if(response){

    }
  };
  const handleSkillCreation = async (skillName,sectionId) => {
    const response = await addSkillToSection(skillName,sectionId);
    if(response){
      
    }
  };
  const [techSections,setTechSections] = useState(data || []);
  useEffect(() => {
    if (techSections.length > 0) {
      setSelectedSection(techSections[0].name);
    }
  }, [data]);
  if (!data) return null;
  return (
    <div id="techStackContainer">
      {techSections.map((sectionData) => {
        const { id, name, skills } = sectionData;
        const skillsArray = skills || [];
        return (
          <div key={id} className='techSectionBox'>
            <span className="sectionTitleRow">
              <h3 className="sectionTitle">{name}</h3>
              {isOwner && (<button className='deleteBtn'
                                   onClick={()=>deleteTechStackSection(id)}
                            >X</button>)}
            </span>
            <div className="skillsGrid">
              {skillsArray.map((skillData) => {
                const { id: skillId, name: skillName } = skillData;
                return (
                  <span key={skillId} className="skillBadge">
                    <span>{skillName}</span>
                    {isOwner && (<button className='deleteBtn' onClick={()=>handleSkillDeletion(skillId)}>X</button>)}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
      {isOwner && (
        <div className="techStackActions">
          <select
            className="sectionSelect"
            value={selectedSection}
            onChange={(e) => {
              setAddNew(false);
              setSelectedSection(e.target.value)
              setSectionTitle(e.target.value);
            }}
          >
            {techSections.map((sectionData) => {
              const { id, name } = sectionData;
              return (
                <option key={id} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
          <TechnicalSkillInput isOwner={isOwner}
                               modifyChanges={setTechSections}
                               title={sectionTitle}
                               modifyTitle={setSectionTitle}
                               addNew={addNew}
                               setAddNew={setAddNew}
          />
        </div>
      )}
    </div>
  );
}
function UserProfileSections({owner,sections}){
  if(!sections)return null;
  const initialSections = Array.isArray(sections) ? sections : Object.values(sections);
  const [profileSections, setProfileSections] = useState(initialSections);
  const [titleValue,setTitleValue] = useState('');
  const [contentValue,setContentValue] = useState('');
  const [selectedId,setSelectedId] = useState(-1);
  const [addNew,setAddNew] = useState(true);
  const renderEditData = (id,name,description) => {
    setAddNew(false);
    setSelectedId(id);
    setTitleValue(name);
    setContentValue(description);
  }
  const resetForm = () => {
    setAddNew(true);
    setSelectedId(-1);
    setTitleValue('');
    setContentValue('');
  }
  const handleSectionModify = async (id,name,description) => {
    const response = await modifyProfileSection(id,name,description);
    if(response){
      const newSections = profileSections.map((section)=>{
        if(section.id === id){
          return {
            ...section,
            name:name,
            content:description
          }
        }
        return section
      })
      setProfileSections(newSections);
      resetForm();
    }else{
      
    }
  }
  const handleSectionAdd = async (name,description) => {
    const response = await addProfileSection(name,description);
    if(typeof response === 'number'){
      const newSections = [
        ...profileSections,
        {
          id:response,
          name:name,
          description:description,
          hidden:false
        }
      ];
      setProfileSections(newSections);
      resetForm();
    }
    else{

    }
  };
  const handleSectionDelete = async (id) => {
    if(typeof id !== 'number'){
      return;
    }
    const response = await deleteProfileSection(id);
    if(response){
      const remainingSections = profileSections.filter(section=>section.id!==id);
      setProfileSections(remainingSections);
      resetForm();
      //notify
    }
    else{
      //handle bad scenario
    }
  };
  return( 
        <div id="sections">
          {profileSections.map(([key,sectionData])=>{
            const {id,name,content,hidden} = sectionData;
            return (
                <div key={id} className='sectionTitle'>
                  <h2>{name}</h2>
                  <span className='sectionContent'>{content}</span>
                  {owner && (
                    <div>
                      <button className='deleteBtn'
                              onClick={()=>handleSectionDelete(id)}
                      >X</button>
                      <button className='editBtn'
                              onClick={()=>renderEditData(id,name,content)}
                      >Edit</button></div>
                    )}
                </div>
            );
          })
          }
          {owner && <div className="addNewSection">
            <input className='sectionTitleInput'
                   type='text'
                   value={titleValue}
                   onChange={(e)=>{
                    setTitleValue(e.target.value);
                   }}
                   placeholder='Add a title for the new section...'/>
            <textarea className='sectionContentInput'
                      value={contentValue}
                      onChange={(e)=>setContentValue(e.target.value)}
                      placeholder='Add content for the new section...'/>
            <button className='addBtn'
                    onClick={()=>{
                      if(addNew)handleSectionAdd(titleValue,contentValue);
                      else handleSectionModify(selectedId,titleValue,contentValue);
                    }}
            >
              {addNew?'Add new section':'Edit section'}
            </button>
          </div>
          }
        </div>
  );
}
function UserProjects({projects}){
  const navigate = useNavigate();
  const userProjects = Object.entries(projects);
  return <div id="userProjects">
            {userProjects.map(([key,objectData])=>{
                const {name,description} = objectData;
                return (
                  <div key={`project-${name}`} className='projectSection'>
                    <h2 className='projectPageLinkContainer'>
                      <Link to={`/projects/${name}`} className='projectPageLink'>{name}</Link>
                    </h2>
                    <div className='projectDescription'>{description}</div>
                  </div>
                );
            })
            }
        </div>;
}
function ProfilePage() {
    const { username } = useParams(); 
    const [profileData, setProfileData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            const data = await accesProfilePage(username);
            setProfileData(data);
        };
        if (username) {
            fetchData();
        }
    }, [username]);
    if (!profileData) {
        return <div style={{ color: 'white', padding: '20px' }}>Loading Sentinel Data...</div>;
    }
    const upperContainerData = {
        sentToHim: profileData.sent_to_him,
        receivedFromHim: profileData.recieved_from_him,
        friends: profileData.friends,
        friendshipRequestId: profileData.friendship_request_id,
        profile_picture: `${BASE_URL}${profileData.user_avatar}`,
        background_picture: `${BASE_URL}${profileData.background_picture}`,
        isOwner:profileData.is_owner
    };
    const techStack = profileData.techstack_category;
    const isOwner = profileData.is_owner;
    const profileSections = profileData.profile_sections;
    const projects = profileData.user_projects;
    return (
        <div id="mainPfpContainer">
            <UpperContainer data={upperContainerData} />
            <div id="mainUserDataContent">
                <UserTechStack isOwner={isOwner} data={techStack}/>
                <UserProfileSections owner={isOwner} sections={profileSections}/>
                <UserProjects projects={projects}/>
            </div>
        </div>
    );
}
export default ProfilePage;