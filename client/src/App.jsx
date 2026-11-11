
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import StudentRegistration from "./pages/StudentRegistration";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import StudentsList from "./pages/StudentsList";
import StudentEdit from "./pages/StudentEdit";
import StudentDetails from "./pages/StudentDetails";
import Dashboard from "./pages/Dashboard";

// Task 12 pages
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Instructors from "./pages/Instructors";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/students/:id" element={<StudentDetails />} />

          {/* Student routes */}
          <Route path="/student-registration" element={<StudentRegistration />} />
          <Route path="/students" element={<StudentsList />} />
          <Route path="/students/edit/:id" element={<StudentEdit />} />

          {/* Course routes */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />

          {/* Instructor routes */}
          <Route path="/instructors" element={<Instructors />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
