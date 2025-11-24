import { useState } from "react";
import { FolderKanban, Lightbulb } from "lucide-react";
import Projects from "./Projects";
import IdeaSpace from "./IdeaSpace";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<"projects" | "ideas">("projects");

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab("projects")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === "projects"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    <FolderKanban className="w-5 h-5" />
                    Projects
                </button>
                <button
                    onClick={() => setActiveTab("ideas")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === "ideas"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    <Lightbulb className="w-5 h-5" />
                    Ideas
                </button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "projects" && <Projects />}
                {activeTab === "ideas" && <IdeaSpace />}
            </div>
        </div>
    );
};

export default Dashboard;
