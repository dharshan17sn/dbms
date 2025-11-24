import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { Users, MessageSquare, ClipboardList } from "lucide-react";

interface TeamMember {
    userId: string;
    isOwner: boolean;
    user: {
        id: string;
        displayName: string;
    };
    role?: {
        id: number;
        name: string;
    };
}

interface TeamProject {
    id: string;
    title: string;
    description: string;
    isTeam: boolean;
    owner: {
        id: string;
        displayName: string;
    };
    members: TeamMember[];
    _count?: {
        members: number;
    };
}

const MyTeams = () => {
    const [searchParams] = useSearchParams();
    const [teams, setTeams] = useState<TeamProject[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<TeamProject | null>(null);
    const [activeTab, setActiveTab] = useState<"members" | "chat" | "works">("members");

    const fetchTeams = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/projects", {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Filter only team projects where user is a member
            const userTeams = data.filter((project: TeamProject) =>
                project.isTeam && project.members && project.members.length > 0
            );

            setTeams(userTeams);

            const teamIdFromUrl = searchParams.get("teamId");
            if (teamIdFromUrl) {
                const targetTeam = userTeams.find((t: TeamProject) => t.id === teamIdFromUrl);
                if (targetTeam) {
                    fetchTeamDetails(targetTeam.id);
                } else if (userTeams.length > 0 && !selectedTeam) {
                    fetchTeamDetails(userTeams[0].id);
                }
            } else if (userTeams.length > 0 && !selectedTeam) {
                fetchTeamDetails(userTeams[0].id);
            }
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeamDetails = async (teamId: string) => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`http://localhost:4000/api/projects/${teamId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedTeam(data);
        } catch (error) {
            console.error("Error fetching team details:", error);
        }
    };

    return (
        <div>
            {teams.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">You're not part of any teams yet</p>
                    <p className="text-sm text-gray-500">Join a team project from the Projects page to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    {/* Teams List Sidebar */}
                    <div className="col-span-3 bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg font-semibold mb-4">Your Teams</h2>
                        <div className="space-y-2">
                            {teams.map(team => (
                                <div
                                    key={team.id}
                                    onClick={() => {
                                        fetchTeamDetails(team.id);
                                    }}
                                    className={`p-3 rounded-md cursor-pointer transition-colors ${selectedTeam?.id === team.id
                                        ? 'bg-blue-100 border-l-4 border-blue-600'
                                        : 'hover:bg-gray-100'
                                        }`}
                                >
                                    <h3 className="font-medium text-sm">{team.title}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {team._count?.members || team.members.length} members
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Details */}
                    <div className="col-span-9 bg-white rounded-lg shadow-md">
                        {selectedTeam && (
                            <>
                                {/* Team Header */}
                                <div className="p-6 border-b">
                                    <h2 className="text-2xl font-bold mb-2">{selectedTeam.title}</h2>
                                    <p className="text-gray-600">{selectedTeam.description}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Owner: {selectedTeam.owner.displayName}
                                    </p>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b">
                                    <button
                                        onClick={() => setActiveTab("members")}
                                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === "members"
                                            ? "text-blue-600 border-b-2 border-blue-600"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <Users className="w-5 h-5" />
                                        Members
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("chat")}
                                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === "chat"
                                            ? "text-blue-600 border-b-2 border-blue-600"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Chat
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("works")}
                                        className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${activeTab === "works"
                                            ? "text-blue-600 border-b-2 border-blue-600"
                                            : "text-gray-600 hover:text-gray-900"
                                            }`}
                                    >
                                        <ClipboardList className="w-5 h-5" />
                                        Assigned Works
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    {activeTab === "members" && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
                                            <div className="space-y-3">
                                                {selectedTeam.members.map(member => (
                                                    <div
                                                        key={member.userId}
                                                        className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                                {member.user.displayName[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{member.user.displayName}</p>
                                                                {member.role && (
                                                                    <p className="text-sm text-gray-600">{member.role.name}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {member.isOwner && (
                                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                                                Owner
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "chat" && (
                                        <div className="h-96 flex flex-col border rounded-lg">
                                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                                <div className="text-center text-gray-500 mt-10">
                                                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p>Chat history will appear here</p>
                                                </div>
                                            </div>
                                            <div className="p-4 border-t bg-white">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Type a message..."
                                                        className="flex-1 border rounded-md px-3 py-2"
                                                        disabled
                                                    />
                                                    <button disabled className="bg-blue-600 text-white px-4 py-2 rounded-md opacity-50 cursor-not-allowed">
                                                        Send
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === "works" && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold">Assigned Works</h3>
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    + Assign Task
                                                </button>
                                            </div>
                                            <div className="border rounded-lg p-8 text-center text-gray-500 bg-gray-50">
                                                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>No tasks assigned yet</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTeams;
