import { useState,useEffect } from 'react'
import {tryLogin,signUp} from './utils/login-signup-utils.js'
import './assets/login-page.css'
import slide1 from './assets/slide_image_1.png';
import slide2 from './assets/slide_image_2.png';
import slide3 from './assets/slide_image_3.png';
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
const slides = [
    {
        title: "Instant Repository Sync",
        description: "Connect your GitHub account and push code directly from your dashboard. No terminal bottlenecks, just pure developer velocity.",
        visual: slide1
    },
    {
        title: "Secure Session Shielding",
        description: "Built with enterprise-grade session protection to keep your workspace credentials ironclad.",
        visual: slide2
    },
    {
        title: "Multi-Repo Management",
        description: "Monitor branch protection rules, track active pull requests, and manage multiple codebases from a single, unified view.",
        visual: slide3
    }
];
function InputTab(){
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    return (
        <div className={"loginDiv"}>
            <h1 style={{color:"Green",
                        fontSize:"9rem",
                        position:"absolute",
                        left:"2vw"}}
            >
                Sentinel Flow
            </h1>
            <input className={"inputField"}
                   type={"text"}
                   placeholder={"Enter your username"}
                   onChange={(e)=>setUsername(e.target.value)}
            />
            <input className={"inputField"}
                   type={"password"}
                   placeholder={"Enter your password"}
                   onChange={(e)=>setPassword(e.target.value)}
            />
            <button id={"loginBtn"}
                    onClick={()=>tryLogin(username,password)}
            >
                Log in
            </button>
            <div id={"signUpContainer"}>
                <h2>Don't have an account?
                <button id={"signUpBtn"} value={"Sign up"}
                        onClick={()=>console.log("url to signup")}
                >Sign up
                </button>
                    here on SentinelFlow</h2>
            </div>
        </div>
    )
}
function LoginPageCarousell({slides}){
    const slidesSize = slides.length;
    const [slide,setSlide] = useState(0);
    useEffect(() => {
        setTimeout(()=>{
            setSlide((slide+1)%slidesSize);
        },6000);
    }, [slide]);
    return (
        <div>
            <img className={"slideImage"}
                 src={slides[slide].visual}
                 alt={`Image ${slide + 1}`}
            />
        </div>
    );
}

function LoginPage() {
    return (
        <div id={"loginMainContainer"}>
            <InputTab/>
            <LoginPageCarousell slides={slides}/>
        </div>
    );
}

export default LoginPage;