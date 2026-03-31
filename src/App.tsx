import { Navigate, Route, Routes } from "react-router-dom";
import BlogHome from "@/pages/BlogHome";
import BlogPostPage from "@/pages/BlogPostPage";
import LandingHomeFrame from "@/pages/LandingHomeFrame";

const App = () => (
  <Routes>
    <Route path="/" element={<LandingHomeFrame />} />
    <Route path="/blog" element={<BlogHome />} />
    <Route path="/blog/:slug" element={<BlogPostPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
