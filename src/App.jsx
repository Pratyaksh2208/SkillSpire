import "./App.css";
import { useEffect } from "react"
import { Route, Routes,useNavigate } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Login from "./Pages/Login.jsx";
import Signup from "./Pages/Signup";
import Navbar from "./Components/common/Navbar";
import OpenRoute from "./Components/Core/Auth/OpenRoute.jsx"
import ForgotPassword from "./Pages/ForgotPassword";
import UpdatePassword from "./Pages/UpdatePassword";
import VerifyEmail from "./Pages/VerifyEmail";
import MyProfile from "./Components/Core/Dashboard/MyProfile";
import Dashboard from "./Pages/Dashboard";
import PrivateRoute from "./Components/Core/Auth/PrivateRoute";
import Error from "./Pages/Error"
// import About from "./Pages/About";
// import Contact from "./Pages/Contact";
//import Setting from "./Components/Core/Dashboard/Settings";
import EnrolledCourses from "./Components/Core/Dashboard/EnrolledCourses";
import { ACCOUNT_TYPE } from "./utils/constants";
import { useDispatch, useSelector } from "react-redux";
import Catalog from "./Pages/Catalog"
import CourseDetails from "./Pages/CourseDetails";
import AddCourse from "./Components/Core/Dashboard/AddCourse"
import Cart from "./Components/Core/Dashboard/Cart"
import EditCourse from "./Components/Core/Dashboard/EditCourse"
import Instructor from "./Components/Core/Dashboard/Instructor"
import MyCourses from "./Components/Core/Dashboard/MyCourses"
import VideoDetails from "./Components/Core/ViewCourse/VideoDetails"
import ViewCourse from "./Pages/ViewCourse"
import { getUserDetails } from "./services/operations/profileAPI"

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.profile)
return (
  <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
   <Navbar/>
   <Routes>
     <Route path="/" element={<Home/>} />
     <Route path="catalog/:catalogName" element={<Catalog/>} />
     <Route path="courses/:courseId" element={<CourseDetails/>} />
     
     <Route
         path="signup"
         element={
           <OpenRoute>
             <Signup />
           </OpenRoute>
         }
       />
   <Route
         path="login"
         element={
           <OpenRoute>
             <Login />
           </OpenRoute>
         }
       />

   <Route
         path="forgot-password"
         element={
           <OpenRoute>
             <ForgotPassword />
           </OpenRoute>
         }
       />  

     <Route
         path="verify-email"
         element={
           <OpenRoute>
             <VerifyEmail />
           </OpenRoute>
         }
       />  

   <Route
         path="update-password/:id"
         element={
           <OpenRoute>
             <UpdatePassword />
           </OpenRoute>
         }
       />  

   {/* <Route
         path="/about"
         element={
           
             <About />
           
         }
       />
  <Route path="/contact" element={<Contact />} /> */}

   <Route 
     element={
       <PrivateRoute>
         <Dashboard />
       </PrivateRoute>
     }
   >
     <Route path="dashboard/my-profile" element={<MyProfile />} />
     
     {/* <Route path="dashboard/Settings" element={<Settings />} /> */}
     

     {
       user?.accountType === ACCOUNT_TYPE.STUDENT && (
         <>
         <Route path="dashboard/cart" element={<Cart />} />
         <Route path="dashboard/enrolled-courses" element={<EnrolledCourses />} />
         </>
       )
     }

{ user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
                                        <>
                                            <Route path="dashboard/instructor" element={<Instructor />} />
                                            <Route path="dashboard/add-course" element={<AddCourse />} />
                                            <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
                                            <Route path="dashboard/my-courses" element={<MyCourses />} />    
                                        </>
                                  )
                    }

   </Route>

   
     <Route element={
       <PrivateRoute>
         <ViewCourse />
       </PrivateRoute>
     }>

     {
       user?.accountType === ACCOUNT_TYPE.STUDENT && (
         <>
         <Route 
           path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
           element={<VideoDetails />}
         />
         </>
       )
     }

     </Route>



   <Route path="*" element={<Error />} />


   </Routes>

  </div>
 );
}

export default App;