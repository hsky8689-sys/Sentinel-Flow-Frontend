import { useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import LoginPage from './Login.jsx'
import SignUpPage from './SignUpPage.jsx'
import SearchPage from './SearchPage.jsx';
import ProjectPage from './ProjectPage.jsx';
import ProjectPreview from './ProjectPreview.jsx';
import ProjectCreationPage from './ProjectCreationPage.jsx';
import './App.css'
import ProfilePage, { UserTechStack, UserProfileSections } from './ProfilePage.jsx';
function DevSyncTest(){
  const [techStack, setTechStack] = useState([
    {id:1, name:'backend', skills:[{id:1,name:'C'}]}
  ]);
  const [sections, setSections] = useState([
    {id:1,name:'Despre mine',content:'Continut initial'}
  ]);
  return (
    <div id="mainUserDataContent">
      <UserTechStack isOwner={true} data={techStack}/>
      <UserProfileSections owner={true} sections={sections}/>
      <button id="simulateFetchBtn" onClick={() => {
        setTechStack([
          {id:1, name:'backend', skills:[{id:1,name:'C'}]},
          {id:2, name:'frontend', skills:[{id:2,name:'React'}]}
        ]);
        setSections([
          {id:1,name:'Despre mine',content:'Continut initial'},
          {id:2,name:'Sectiune noua',content:'Adaugata dupa fetch simulat'}
        ]);
      }}>Simuleaza fetch nou</button>
    </div>
  );
}
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LoginPage/>}></Route>
              <Route path="/signup" element={<SignUpPage/>}></Route>
              <Route path='/user-profile/:username' element={<ProfilePage/>}></Route>
              <Route path='/dev-sync-test' element={<DevSyncTest/>}></Route>
              <Route path="/search-page" element={<SearchPage/>}></Route>
              <Route path='/project-creation-page' element={<ProjectCreationPage/>}></Route>
              <Route path="/project-page/:project-name" element={<ProjectPage/>}></Route>
              <Route path="/project-creation-page" element={<LoginPage/>}></Route>
              <Route path="/chat-conversations" element={<LoginPage/>}></Route>
              <Route path="/inbox" element={<LoginPage/>}></Route>
          </Routes>
      </BrowserRouter>
      );
}

export default App
