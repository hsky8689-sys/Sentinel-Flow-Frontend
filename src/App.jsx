import { useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import LoginPage from './Login.jsx'
import SignUpPage from './SignUpPage.jsx'
import SearchPage from './SearchPage.jsx';
import ProjectPage from './ProjectPage.jsx';
import ProjectCreationPage from './ProjectCreationPage.jsx';
import InboxPage from './InboxPage.jsx';
import ChatPage from './ChatPage.jsx';
import './App.css'
import ProfilePage, { UserTechStack, UserProfileSections } from './ProfilePage.jsx';
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LoginPage/>}></Route>
              <Route path="/signup" element={<SignUpPage/>}></Route>
              <Route path='/user-profile/:username' element={<ProfilePage/>}></Route>
              <Route path="/search-page" element={<SearchPage/>}></Route>
              <Route path='/project-creation-page' element={<ProjectCreationPage/>}></Route>
              <Route path="/project-page/:project-name" element={<ProjectPage/>}></Route>
              <Route path="/chat-conversations" element={<ChatPage/>}></Route>
              <Route path="/inbox" element={<InboxPage/>}></Route>
          </Routes>
      </BrowserRouter>
      );
}

export default App
