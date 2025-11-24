import { useState, useEffect } from "react";
import { Users, UserCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import MyTeams from "./MyTeams";
import MyFriends from "./MyFriends";

const Network = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"teams" | "friends">("teams");

    useEffect(() => {
        if (location.pathname.includes("/friends")) {
            setActiveTab("friends");
        } else {
            setActiveTab("teams");
        }
    }, [location.pathname]);

    const handleTabChange = (tab: "teams" | "friends") => {
        setActiveTab(tab);
        navigate(`/network/${tab}`);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">My Network</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => handleTabChange("teams")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === "teams"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    <Users className="w-5 h-5" />
                    My Teams
                </button>
                <button
                    onClick={() => handleTabChange("friends")}
                    className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${activeTab === "friends"
                        ? "text-blue-600 border-b-2 border-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                        }`}
                >
                    <UserCheck className="w-5 h-5" />
                    My Friends
                </button>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "teams" && <MyTeams />}
                {activeTab === "friends" && <MyFriends />}
            </div>
        </div>
    );
};

export default Network;
