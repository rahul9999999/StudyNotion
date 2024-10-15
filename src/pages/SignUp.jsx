import React from 'react'
import Templete from '../components/core/Auth/Templete'
import signUpImg from "../assets/Images/signup.webp"

const SignUp = () => {
  return (
    <div>
        <Templete title="Join the millions learning to code with StudyNotion for free"
        description1="Build skills for today, tomorrow, and beyond."
        description2="Education to future-proof your career."
        formType="Signup"
        image={signUpImg}/>  
    </div>
  )
}

export default SignUp
