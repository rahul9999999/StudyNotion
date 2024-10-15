import React, { useState } from 'react'
import loginImg from "../assets/Images/login.webp"
import Templete from '../components/core/Auth/Templete'
import { login } from '../services/operations/authApi'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { TbCornerDownRightDouble } from "react-icons/tb"
import { BsLightningChargeFill } from "react-icons/bs"
import { MdCancel } from "react-icons/md";
import { MdCancelPresentation } from "react-icons/md";
import { MdOutlineCancel } from "react-icons/md";


const Login = () => {
  const [showDemo, setShowDemo] = useState(true)
  const navigate=useNavigate()
  const dispatch=useDispatch()
  
  return (
    <div>
      {/* test login ID */}
    <div  className={`${showDemo ? "":"hidden"} justify-center items-center absolute bg-richblack-400 top-52 md:top-32 md:right-[50%] right-[10%] p-6 -rotate-[20deg] z-20 `}>
      <div className="flex flex-col gap-2 relative">
        <div onClick={()=>{setShowDemo(false)}} className="absolute top-[-27px] right-[-17px] text-5xl  rounded-full w-[27px] h-[40px] flex justify-center items-center cursor-pointer text-white">
       <MdOutlineCancel/>

        </div>
        <div className=" gap-y-2 flex flex-col">
        <p className="text-2xl font-extrabold text-richblack-5 flex items-center">Take a Demo &nbsp; <BsLightningChargeFill size={20}/></p>
        <div>
        <button onClick={
          () => {
            dispatch(login("sanjuktapanda416@gmail.com", "1234", navigate)
          )}
        } className="bg-yellow-100 font-semibold mt-4 mb-1 text-richblack-900 px-4 py-2 rounded-md flex">
          <TbCornerDownRightDouble className="text-2xl text-richblack-900 hidden md:block"/>
          Click here for Instructor Demo</button>
      </div>
      <div>
        <button onClick={
          () => {
            dispatch(login("rahulkumarpanda999@gmail.com", "1234", navigate)
          )}
        } className="bg-yellow-100 font-semibold text-richblack-900 px-4 py-2 rounded-md flex">
          <TbCornerDownRightDouble className="text-2xl text-richblack-900 md:block hidden"/>
          Click here for Student Demo</button>
        </div>
        </div>
      </div>
    </div>


      <Templete title="Welcome Back" 
      description1="Build skills for today, tomorrow, and beyond."
      description2="Education to future-proof your career."
      formType="Login"
      image={loginImg}/>

    </div>
  )
}

export default Login
