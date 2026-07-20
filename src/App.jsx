import { useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import LoginPage from './Login.jsx'
import SignUpPage from './SignUpPage.jsx'
import './App.css'
import ProfilePage from './ProfilePage.jsx';
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LoginPage/>}></Route>
              <Route path="/signup" element={<SignUpPage/>}></Route>
              <Route path='/user-profile/:username' element={<ProfilePage/>}></Route>
          </Routes>
      </BrowserRouter>
      );
}

export default App
