import { useState,useEffect } from 'react'
import { Link } from 'react-router-dom';
import {tryLogin} from './utils/login-signup-utils.js'
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
            <h1 style={{
                fontFamily: "'Orbitron', sans-serif",
                color: "green",
                fontSize: "9rem",
                textAlign: "center",
                margin: "0 auto 40px auto",
                textTransform: "uppercase",
                letterSpacing: "6px"
            }}>
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
                <p style={{ margin: 0, fontFamily: 'monospace', color: 'greenyellow' }}>
                    You don't have an account, then{' '}
                    <Link to="/signup" id="signup"
                          style={{margin:'0 5px',underline:'none'}}>
                        sign up
                    </Link>
                    {' '}on sentinel flow
                </p>
            </div>
        </div>
    )
}
function LoginPageCarousell({slides,slide,setSlide,timer,setTimer}) {
    const slidesSize = slides.length;
    function changeSlide(left){
        if(typeof left !== "boolean"){
            return;
        }
        setSlide((slidesSize +slide + (left ? -1 : 1))%slidesSize);
        setTimer(10000);
    }
    useEffect(() => {
        const interval = setInterval(() => {
            setSlide((prevSlide) => (prevSlide + 1) % slidesSize);
        }, timer);
        return () => clearInterval(interval);
    }, [slidesSize,timer]);

    return (
        <div className={"carousel"}>
            <div className={"carouselWrapper"}>
            <button id={"rightChange"}
                    onClick={()=>changeSlide(false)}/>
            <img
                key={slide}
                className="slideImage active"
                src={slides[slide].visual}
                alt={`Image ${slide + 1}`}
            />
            <button id={"leftChange"}
                    onClick={()=>changeSlide(true)}/>
            </div>
        </div>
    );
}
function BottomDotList({slide,setSlide,setTimer}){
    const slidesSize = slides.length;
    const handleDotClick = (index) => {
        setSlide(index);
        setTimer(10000);
    };
    return (
        <div className="dotsContainer">
            {Array.from({ length: slidesSize }, (_, i) => {
                const isActive = i === slide;
                return (
                    <div
                        key={i}
                        id={`dot-${i}`}
                        className={`bottomDot ${isActive ? 'active' : ''}`}
                        onClick={() => handleDotClick(i)}
                    ></div>
                );
            })}
        </div>
    );
}
function LoginPage() {
    const [slide, setSlide] = useState(0);
    const [timer,setTimer] = useState(10000);
    return (
        <div id={"loginMainContainer"}>
            <InputTab/>
            <div>
                <LoginPageCarousell slides={slides}
                                    slide={slide}
                                    timer={timer}
                                    setSlide={setSlide}
                                    setTimer={setTimer}
            />
            <BottomDotList slide={slide}
                           setSlide={setSlide}
                           setTimer={setTimer}/>
            </div>
        </div>
    );
}

export default LoginPage;