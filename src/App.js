import { Route, Routes } from "react-router";
import "./App.css"
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Navbar from "./components/common/Navbar";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyOtp from "./pages/VerifyOtp";
import About from "./pages/About";
import Contact from "./pages/ContactUs";
import { setProgress } from "./slices/loadingBarSlice.js";
import DashBoard from "./pages/DashBoard.jsx";
import PrivateRoute from "./components/core/Auth/PrivateRoute.jsx";
import MyProfile from "./components/core/Dashboard/MyProfile.jsx";
import Error from "./components/Error.jsx";
import EntrolledCourses from "./components/core/Dashboard/EntrolledCourses";
import CartIndex from "./components/core/Dashboard/cart/Index.jsx";
import { useDispatch, useSelector } from "react-redux";
import { ACCOUNT_TYPE } from "./utils/constants";
import CourseIndex from "./components/core/Dashboard/addCourse/Index.jsx";
import Setting from "./components/core/Dashboard/Setting.jsx";
import Footer from "./components/common/Footer";
import MyCourses from "./components/core/Dashboard/myCourses/MyCourses.jsx";
import EditCourse from "./components/core/Dashboard/EditCourse/EditCourse.jsx";
import Catalog from "./pages/Catalog.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import { apiConnector } from "./services/apiConnecter.js";
import { endpoints } from "./services/apis.js";
import { useEffect } from "react";
import { setToken } from "./slices/authSlice.js";
import { setUser } from "./slices/profileSlice.js";
import ViewCourse from "./pages/ViewCourse.jsx";
import VideoDetails from "./components/core/ViewCourse/VideoDetails.jsx";
import InstructorDashboard from "./components/core/Dashboard/InstructorDashboard/InstructorDashboard";
import LoadingBar from "react-top-loading-bar";
import { RiWifiOffLine } from "react-icons/ri";
import SearchCourse from "./pages/SearchCourse";
import ScrollToTop from "./components/ScrollToTop.js";
import AdminPannel from "./components/core/Dashboard/AdminPannel";

const { CHECK_AUTHENTICATION } = endpoints



function App() {
  
  const { user } = useSelector(state => state.profile)
  const { token } = useSelector((state) => state.auth)
  const progress = useSelector((state) => state.loadingBar);


  const dispatch = useDispatch()

  const checkAuthentication = async (token) => {
    try {
      console.log("token", token)
      const response = await apiConnector("POST", CHECK_AUTHENTICATION, {
        data: token
      }, {
        Authorisation: `Bearer ${token}`,
      })
      console.log("response", response)
    } catch (err) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")

      dispatch(setToken(null))
      dispatch(setUser(null))

      console.log("error", err)
    }
  }

  useEffect(() => {
    checkAuthentication(token)
    
  }, [])
  return (
    <div className=" w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">

      <LoadingBar
        color="#fcf7fc"
        height={1.4}
        progress={progress}
        onLoaderFinished={() => dispatch(setProgress(0))}
      />
      <Navbar setProgress={setProgress} />
      {!navigator.onLine && (
        <div className="bg-red-500 flex text-white text-center p-2 bg-richblack-300 justify-center gap-2 items-center">
          <RiWifiOffLine size={22} />
          Please check your internet connection.
          <button
            className="ml-2 bg-richblack-500 rounded-md p-1 px-2 text-white"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyOtp />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/catalog/:catalogName" element={<Catalog />} />
        <Route path="/courses/:courseId" element={<CourseDetails />} />
        <Route path="/search/:searchQuery" element={<SearchCourse />} />

        <Route element={<PrivateRoute><DashBoard /></PrivateRoute>}>
          <Route path="/dashboard/my-profile" element={<MyProfile />} />
          <Route path="/dashboard/settings" element={<Setting />} />


          {
            user?.accountType === ACCOUNT_TYPE.STUDENT && (
              <>
                <Route path="/dashboard/enrolled-courses" element={<EntrolledCourses />} />
                <Route path="/dashboard/cart" element={<CartIndex />} />
              </>
            )
          }
          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
              <>
                <Route path="/dashboard/add-course" element={<CourseIndex />} />
                <Route path="/dashboard/my-courses" element={<MyCourses />} />
                <Route
                  path="dashboard/edit-course/:courseId"
                  element={<EditCourse />}
                />
                <Route
                  path="dashboard/instructor"
                  element={<InstructorDashboard />}
                />
              </>
            )
          }
          {user?.accountType === ACCOUNT_TYPE.ADMIN && (
            <>
              <Route path="dashboard/admin-panel" element={<AdminPannel />} />
            </>
          )}
        </Route>

        <Route
          element={
            <PrivateRoute>
              <ViewCourse />
            </PrivateRoute>
          }
        >
          {user?.accountType === ACCOUNT_TYPE.STUDENT && (
            <>
              <Route
                path="/dashboard/enrolled-courses/view-course/:courseId/section/:sectionId/sub-section/:subsectionId"
                element={<VideoDetails />}
              />
            </>
          )}
        </Route>
        <Route path="*" element={<Error />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
