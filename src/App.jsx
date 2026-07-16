import { useState } from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import LoginPage from './Login.jsx'
import SignUpPage from './SignUpPage.jsx'
import './App.css'
function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LoginPage/>}></Route>
              <Route path="/signup" element={<SignUpPage/>}></Route>
          </Routes>
      </BrowserRouter>
      );
}

export default App
