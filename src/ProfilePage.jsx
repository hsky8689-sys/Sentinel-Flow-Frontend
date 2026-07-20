import {useEffect, useState} from 'react'
import './assets/css/ProfilePage.css'
import { useParams,useNavigate,Link } from 'react-router-dom';
import { accesProfilePage } from './utils/api-utlis';
import { useRef } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL;
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
function UserTechStack({data,isOwner}){
  const [selectedSection, setSelectedSection] = useState('');
  const techSections = data ? Object.entries(data) : [];
  useEffect(() => {
    if(techSections.length > 0){
      setSelectedSection(techSections[0][0]);
    }
  }, [data]);
  if(!data)return null;
  return (
    <div id="techStackContainer">
      {techSections.map(([sectionName, skills]) => (
        <div key={sectionName} className="techSectionBox">
          <span className="sectionTitleRow">
            <h3 className="sectionTitle">{sectionName}</h3>
            {isOwner && (<button className='deleteBtn'>X</button>)}
          </span>
          <div className="skillsGrid">
            {skills.map(skill => (
            <span key={skill} className="skillBadge">
              <span>
                {skill}
              </span>
              {isOwner && (<button className='deleteBtn'>X</button>)}
            </span>
            ))}
          </div>
        </div>
      ))}
      {isOwner && (
        <div className="techStackActions">
          <select
            className="sectionSelect"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            {techSections.map(([sectionName]) => (
              <option key={sectionName} value={sectionName}>{sectionName}</option>
            ))}
          </select>
          <input type="text" placeholder="add new section..." className="addSectionInput"/>
          <input type="text" placeholder="add new skill to section" className="addSkillInput"/>
        </div>
      )}
    </div>
  );
}
function UserProfileSections({owner,sections}){
  if(!sections)return null;
  const profileSections = Object.entries(sections);
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
                      <button className='deleteBtn'>X</button>
                      <button className='editBtn'>Edit</button></div>
                    )}
                </div>
            );
          })
          }
          {owner && <div className="addNewSection">
            <input className='sectionTitleInput' type='text' placeholder='Add a title for the new section...'/>
            <textarea className='sectionContentInput' 
                      placeholder='Add content for the new section...'/>
            <button className='addBtn'>Add new section</button>
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
                  <div key={`project-${name}`}className='projectSection'>
                    <h2><Link to={`/projects/${name}`} style={{textDecoration:"none"}}>{name}</Link></h2>
                    <h3>{description}</h3>
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