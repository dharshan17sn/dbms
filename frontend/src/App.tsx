import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Placements from "./pages/Placements";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import IdeaSpace from "./pages/IdeaSpace";
import Notifications from "./pages/Notifications";
import Network from "./pages/Network";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Navigate to="/auth" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="projects" element={<Projects />} />
                    <Route path="projects/:id" element={<ProjectDetails />} />
                    <Route path="chat/ideas" element={<Chat type="IDEA" />} />
                    <Route path="chat/projects/:projectId" element={<Chat type="PROJECT" />} />
                    <Route path="placements" element={<Placements />} />
                    <Route path="ideas" element={<IdeaSpace />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="network/*" element={<Network />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
