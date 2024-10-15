import { combineReducers } from "redux";
import authReducer from '../slices/authSlice'
import profileReducer from "../slices/profileSlice";
import loadingBarReducer from "../slices/loadingBarSlice";
import cartReducer from "../slices/cartSlice"
import courseReducer from "../slices/courseSlice";
import viewCourseReducer from "../slices/viewCourseSlice";




const rootReducer=combineReducers({
    auth:authReducer,
    cart:cartReducer,
    profile:profileReducer,
    loadingBar: loadingBarReducer,
    course:courseReducer,
    viewCourse:viewCourseReducer,
    
})

export default rootReducer;