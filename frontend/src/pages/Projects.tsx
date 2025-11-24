import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, ThumbsUp, MessageCircle, UserPlus, Users, X, Search, Send } from "lucide-react";

interface Role {
    id: number;
    name: string;
}

interface RoleRequirement {
    roleId: number;
    count: number;
}

interface Project {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    videoUrl?: string;
    imageUrl?: string;
    gitUrl?: string;
    isTeam: boolean;
    teamOpenings: number;
    ownerId: string;
    owner: { id: string; displayName: string; role: string };
    _count?: { comments: number; upvotes: number; members: number };
    roleRequirements?: Array<{
        id: string;
        roleId: number;
        count: number;
        role: { id: number; name: string };
    }>;
    members?: Array<{ userId: string; isOwner: boolean }>;
    joinRequests?: Array<{ id: string; status: string }>;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; displayName: string };
}

const Projects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [isTeam, setIsTeam] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<RoleRequirement[]>([]);
    const [roleSearch, setRoleSearch] = useState("");
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        type: "EXPERIMENTAL",
        visibility: "COLLEGE_ONLY",
        status: "OPEN",
        videoUrl: "",
        imageUrl: "",
        gitUrl: "",
    });

    // Comments modal state
    const [showComments, setShowComments] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");

    // Join team modal state
    const [showJoinModal, setShowJoinModal] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    const [joinMessage, setJoinMessage] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user.id;

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/projects", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    };

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/projects/roles", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoles(data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchRoles();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:4000/api/projects", {
                ...newProject,
                isTeam,
                roleRequirements: isTeam ? selectedRoles : []
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowCreate(false);
            setIsTeam(false);
            setSelectedRoles([]);
            setNewProject({
                title: "",
                description: "",
                type: "EXPERIMENTAL",
                visibility: "COLLEGE_ONLY",
                status: "OPEN",
                videoUrl: "",
                imageUrl: "",
                gitUrl: "",
            });
            fetchProjects();
        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:4000/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    const handleUpvote = async (projectId: string) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:4000/api/projects/${projectId}/upvote`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchProjects();
        } catch (error) {
            console.error("Error upvoting:", error);
        }
    };

    const handleSendFriendRequest = async (userId: string) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:4000/api/friends/request",
                { receiverId: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Friend request sent!");
        } catch (error: any) {
            alert(error.response?.data?.error || "Error sending friend request");
        }
    };

    const addRole = (roleId: number) => {
        if (!selectedRoles.find(r => r.roleId === roleId)) {
            setSelectedRoles([...selectedRoles, { roleId, count: 1 }]);
        }
        setRoleSearch("");
    };

    const removeRole = (roleId: number) => {
        setSelectedRoles(selectedRoles.filter(r => r.roleId !== roleId));
    };

    const updateRoleCount = (roleId: number, delta: number) => {
        setSelectedRoles(selectedRoles.map(r =>
            r.roleId === roleId ? { ...r, count: Math.max(1, r.count + delta) } : r
        ));
    };

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(roleSearch.toLowerCase()) &&
        !selectedRoles.find(r => r.roleId === role.id)
    );

    const fetchComments = async (projectId: string) => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(`http://localhost:4000/api/projects/${projectId}/comments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleAddComment = async (projectId: string) => {
        if (!newComment.trim()) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:4000/api/projects/${projectId}/comments`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment("");
            fetchComments(projectId);
            fetchProjects();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleJoinTeam = async (projectId: string) => {
        if (!selectedRole) {
            alert("Please select a role");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:4000/api/projects/${projectId}/join`,
                { roleId: selectedRole, message: joinMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Join request sent!");
            setShowJoinModal(null);
            setSelectedRole(null);
            setJoinMessage("");
        } catch (error: any) {
            alert(error.response?.data?.error || "Error sending join request");
        }
    };

    const isUserMember = (project: Project) => {
        return project.members && project.members.length > 0;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Projects</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h3 className="text-xl font-semibold mb-4">Create New Project</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title *</label>
                            <input
                                type="text"
                                value={newProject.title}
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                rows={3}
                            />
                        </div>

                        {/* Create as Team Checkbox */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isTeam"
                                checked={isTeam}
                                onChange={(e) => setIsTeam(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="isTeam" className="ml-2 block text-sm text-gray-900">
                                Create as Team
                            </label>
                        </div>

                        {/* Role Selection UI */}
                        {isTeam && (
                            <div className="border rounded-md p-4 bg-gray-50">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Team Role Requirements</label>

                                {/* Role Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        value={roleSearch}
                                        onChange={(e) => setRoleSearch(e.target.value)}
                                        className="pl-10 w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    />
                                    {roleSearch && filteredRoles.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {filteredRoles.map(role => (
                                                <div
                                                    key={role.id}
                                                    onClick={() => addRole(role.id)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {role.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Roles */}
                                <div className="space-y-2">
                                    {selectedRoles.map(roleReq => {
                                        const role = roles.find(r => r.id === roleReq.roleId);
                                        return (
                                            <div key={roleReq.roleId} className="flex items-center justify-between bg-white p-2 rounded border">
                                                <span className="text-sm font-medium">{role?.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateRoleCount(roleReq.roleId, -1)}
                                                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-8 text-center">{roleReq.count}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateRoleCount(roleReq.roleId, 1)}
                                                        className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRole(roleReq.roleId)}
                                                        className="ml-2 text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {selectedRoles.length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-2">No roles added yet. Search and add roles above.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={newProject.status}
                                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                >
                                    <option value="OPEN">Just Started</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Git Repository URL</label>
                                <input
                                    type="url"
                                    value={newProject.gitUrl}
                                    onChange={(e) => setNewProject({ ...newProject, gitUrl: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Video URL</label>
                                <input
                                    type="url"
                                    value={newProject.videoUrl}
                                    onChange={(e) => setNewProject({ ...newProject, videoUrl: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                <input
                                    type="url"
                                    value={newProject.imageUrl}
                                    onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreate(false);
                                    setIsTeam(false);
                                    setSelectedRoles([]);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Create Project
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Projects List */}
            <div className="grid grid-cols-1 gap-6">
                {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No projects yet. Create one!</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
                            {/* Person name with connection button */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-semibold text-gray-800">{project.owner.displayName}</h4>
                                    {project.ownerId !== currentUserId && (
                                        <button
                                            onClick={() => handleSendFriendRequest(project.owner.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center hover:bg-blue-700 text-sm"
                                        >
                                            <UserPlus className="w-4 h-4 mr-1" />
                                            Connect
                                        </button>
                                    )}
                                </div>
                                {project.ownerId === currentUserId && (
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded-md flex items-center hover:bg-red-700 text-sm"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                )}
                            </div>

                            {/* Role below person name */}
                            <p className="text-sm text-gray-500 mb-2">{project.owner.role}</p>

                            {/* Project title */}
                            <h3 className="text-xl font-bold text-blue-600 mb-2">{project.title}</h3>

                            {/* Description */}
                            <p className="text-gray-700 mb-4">{project.description}</p>

                            {/* Image if uploaded */}
                            {project.imageUrl && (
                                <div className="mb-4">
                                    <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="w-full max-h-96 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Role Requirements if team */}
                            {project.isTeam && project.roleRequirements && project.roleRequirements.reduce((acc, req) => acc + req.count, 0) > 0 && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Team Requirements:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {project.roleRequirements.filter(req => req.count > 0).map(req => (
                                            <span key={req.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                {req.role.name} ({req.count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Horizontal layout: comments, github link, video link */}
                            <div className="flex items-center gap-6 pt-4 border-t">
                                {/* Comments count - clickable */}
                                <button
                                    onClick={() => {
                                        if (showComments === project.id) {
                                            setShowComments(null);
                                            setComments([]);
                                        } else {
                                            setShowComments(project.id);
                                            fetchComments(project.id);
                                        }
                                    }}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm">{project._count?.comments || 0} comments</span>
                                </button>

                                {/* Upvotes */}
                                <button
                                    onClick={() => handleUpvote(project.id)}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                    <ThumbsUp className="w-5 h-5" />
                                    <span className="text-sm">{project._count?.upvotes || 0}</span>
                                </button>

                                {/* GitHub link with logo */}
                                {project.gitUrl && (
                                    <a
                                        href={project.gitUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        <span className="text-sm">GitHub</span>
                                    </a>
                                )}

                                {/* Video link with logo */}
                                {project.videoUrl && (
                                    <a
                                        href={project.videoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                        </svg>
                                        <span className="text-sm">Video</span>
                                    </a>
                                )}

                                {/* View Team or Join Team button */}
                                {project.isTeam && (
                                    <div className="ml-auto">
                                        {isUserMember(project) ? (
                                            <button
                                                onClick={() => navigate(`/network/teams?teamId=${project.id}`)}
                                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                                            >
                                                <Users className="w-4 h-4" />
                                                View Team
                                            </button>
                                        ) : project.joinRequests && project.joinRequests.length > 0 ? (
                                            <button
                                                disabled
                                                className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md cursor-not-allowed text-sm"
                                            >
                                                <Users className="w-4 h-4" />
                                                Request Pending
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setShowJoinModal(project.id)}
                                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                                            >
                                                <Users className="w-4 h-4" />
                                                Join Team
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Inline Comments Section */}
                            {showComments === project.id && (
                                <div className="mt-4 border-t pt-4">
                                    <div className="space-y-3 mb-4">
                                        {comments.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No comments yet.</p>
                                        ) : (
                                            comments.map(comment => (
                                                <div key={comment.id} className="bg-gray-50 p-3 rounded">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm">{comment.user.displayName}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm">{comment.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(project.id)}
                                        />
                                        <button
                                            onClick={() => handleAddComment(project.id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2"
                                        >
                                            <Send className="w-4 h-4" />
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Join Team Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Join Team</h3>
                            <button onClick={() => setShowJoinModal(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                                {projects.find(p => p.id === showJoinModal)?.roleRequirements?.map(req => (
                                    <div
                                        key={req.id}
                                        onClick={() => setSelectedRole(req.roleId)}
                                        className={`p-3 border rounded-md cursor-pointer mb-2 ${selectedRole === req.roleId ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{req.role.name}</span>
                                            <span className="text-sm text-gray-600">{req.count} needed</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                                <textarea
                                    value={joinMessage}
                                    onChange={(e) => setJoinMessage(e.target.value)}
                                    placeholder="Why do you want to join this team?"
                                    className="w-full border rounded-md px-3 py-2"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={() => handleJoinTeam(showJoinModal)}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
