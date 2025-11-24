import { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: "",
        skills: "",
        resumeLink: "",
        cgpa: "",
        researchPapers: "",
    });

    // Get user role
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "STUDENT";

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/dashboard/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfile(data);
            setFormData({
                bio: data.bio || "",
                skills: data.skills.join(", "),
                resumeLink: data.resumeLink || "",
                cgpa: data.cgpa || "",
                researchPapers: data.researchPapers?.join(", ") || "",
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const updateData: any = {
                bio: formData.bio,
                skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
            };

            if (userRole === "STUDENT") {
                updateData.resumeLink = formData.resumeLink;
                updateData.cgpa = parseFloat(formData.cgpa);
            } else if (userRole === "MENTOR") {
                updateData.researchPapers = formData.researchPapers.split(",").map((s) => s.trim()).filter(Boolean);
            }

            await axios.put(
                "http://localhost:4000/api/dashboard/profile",
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-blue-600 text-white">
                    <h2 className="text-2xl font-bold">{profile.user.displayName}</h2>
                    <p className="opacity-90">{profile.user.email}</p>
                    <span className="inline-block bg-blue-700 px-2 py-1 rounded text-sm mt-2">
                        {profile.user.role}
                    </span>
                </div>

                <div className="p-6">
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                />
                            </div>
                            {userRole === "STUDENT" && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Resume Link</label>
                                        <input
                                            type="url"
                                            value={formData.resumeLink}
                                            onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">CGPA</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.cgpa}
                                            onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        />
                                    </div>
                                </>
                            )}
                            {userRole === "MENTOR" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Research Papers (comma separated)</label>
                                    <textarea
                                        value={formData.researchPapers}
                                        onChange={(e) => setFormData({ ...formData, researchPapers: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                        rows={3}
                                        placeholder="Paper 1, Paper 2, Paper 3"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                                <p className="mt-1">{profile.bio || "No bio added yet."}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Skills</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {profile.skills.length > 0 ? (
                                        profile.skills.map((skill: string, index: number) => (
                                            <span
                                                key={index}
                                                className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No skills listed.</p>
                                    )}
                                </div>
                            </div>
                            {userRole === "STUDENT" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">CGPA</h3>
                                        <p className="mt-1">{profile.cgpa || "N/A"}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Resume</h3>
                                        <p className="mt-1">
                                            {profile.resumeLink ? (
                                                <a
                                                    href={profile.resumeLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View Resume
                                                </a>
                                            ) : (
                                                "Not uploaded"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {userRole === "MENTOR" && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Research Papers</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {profile.researchPapers && profile.researchPapers.length > 0 ? (
                                            profile.researchPapers.map((paper: string, index: number) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                                                >
                                                    {paper}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-400">No research papers listed.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
