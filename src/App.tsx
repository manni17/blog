import { Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import BlogHome from "@/pages/BlogHome";
import BlogPostPage from "@/pages/BlogPostPage";
import CompleteStoryFrame from "@/pages/CompleteStoryFrame";
import LandingHomeFrame from "@/pages/LandingHomeFrame";
import NotFound from "@/pages/NotFound";

const App = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<LandingHomeFrame />} />
      <Route path="/blog" element={<BlogHome />} />
      <Route path="/blog/the-complete-story" element={<CompleteStoryFrame />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default App;
