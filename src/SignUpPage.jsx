import {useState} from 'react'
import {signUp} from './utils/login-signup-utils.js'
import './assets/signup-page.css'
function SignUpPage(){
    const [user,setUser]=useState("");
    const [pass,setPass]=useState("");
    const [mail,setMail]=useState("");
    const [bday,setBday]=useState("");
    return(
        <div className={"signUpDiv"}>
            <input type={"text"}
                   className={"inputField"}
                   placeholder={"Enter a username"}
                   onChange={(e)=>setUser(e.target.value)}
                   required={true}
            />
            <input type={"text"}
                   className={"inputField"}
                   placeholder={"Enter a password"}
                   onChange={(e)=>setPass(e.target.value)}
                   required={true}
            />
            <input type={"email"}
                   className={"inputField"}
                   placeholder={"Enter a valid email"}
                   onChange={(e)=>setMail(e.target.value)}
                   required={true}
            />
            <input type={"date"}
                   id={"birthdayPicker"}
                   onChange={(e)=>setBday(e.target.value)}
                    required={true}
            />
            <button id={"signUpBtn"}
                    onClick={()=>signUp(user,mail,pass,bday)}
            >
                Sign up
            </button>
        </div>
    );
}
export default SignUpPage;