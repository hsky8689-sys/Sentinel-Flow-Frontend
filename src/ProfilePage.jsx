import {useEffect, useState} from 'react'
import './assets/css/ProfilePage.css'
import { useParams,useNavigate } from 'react-router-dom';
import { accesProfilePage } from './utils/api-utlis';
import { useRef } from 'react';
const BASE_URL = import.meta.env.VITE_API_URL;
function Username(){
   const {username} = useParams();
   return <h1>{username}</h1>
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
    return (<input type={"button"}
                   onClick={null}
            >
              Cancel request
            </input>);
  }
  else if(receivedFromHim){
    return (<div>
              <input type={"button"}
                     onClick={null}
              >
                Accept
              </input>
              <input type={"button"}
                   onClick={null}
              >
                Deny
              </input>
            </div>);
  }
  return;
}
function makeBgStyle({backgroundImageUrl}){
  return {
          display:'flex',
          padding:'2px',
          marginLeft:'2vw',
          marginRight:'2vw',
          borderRadius:'10px',
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '95vw',
          height: '25vh',
          borderRadius: '12px'};
}
function UpperContainer({data}){
  const bgUrl = data.background_pictureck;
  return (
        <div id={"backgroundPicture"}
             style={makeBgStyle({backgroundImageUrl:bgUrl})}
        >
          <div id={"imageWrapper"}>
              <div id={"pfp"}>
                  <img src={bgUrl} 
                       alt={"poza profil"}>
                  </img>
                  <FriendshipStatusButton userData={null}/>
              </div>
          </div>
        </div> 
  );
}
function UserTechStack({data,isOwner}){
  if(!data)return null;
  const techSections = Object.entries(data);
  return (
    <div id="techStackContainer">
      {techSections.map(([sectionName, skills]) => (
        <div key={sectionName} className="techSectionBox">
          <h3 className="sectionTitle">{sectionName}</h3>
          
          <div className="skillsGrid">
            {skills.map(skill => (
              <span key={skill} className="skillBadge">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
      {isOwner && (
        <input type="text" placeholder="add new section..." className="addSectionInput"/>
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
                  {owner && <button>X</button>}
                  <span className='sectionContent'>{content}</span>
                </div>
            );
          })
          }
          {owner && <div className="addNewSection">
            <input type='text' placeholder='Add a title for the new section...'/>
            <input type='text' placeholder='Add content for the new section...'/>
            <button>Add new section</button>
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
                  <div className='projectSection'>
                    <h2>{name}</h2>
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
        background_picture: `${BASE_URL}${profileData.background_picture}`
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