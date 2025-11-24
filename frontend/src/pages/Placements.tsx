import { useEffect, useState } from "react";
import axios from "axios";
import { Briefcase, Plus, Trash2, Edit } from "lucide-react";

interface JobPost {
    id: string;
    title: string;
    description: string;
    company: { name: string };
    minCgpa: number | null;
    requiresVerifiedProject: boolean;
    postedAt: string;
    expiresAt: string | null;
}

const Placements = () => {
    const [jobs, setJobs] = useState<JobPost[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        companyName: "",
        minCgpa: "",
        requiresVerifiedProject: false,
        expiresAt: "",
    });

    // Get user role
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "STUDENT";
    const isCoordinator = userRole === "PLACEMENT_ADMIN";

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/placements", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setJobs(data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:4000/api/placements",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowCreate(false);
            setFormData({
                title: "",
                description: "",
                companyName: "",
                minCgpa: "",
                requiresVerifiedProject: false,
                expiresAt: "",
            });
            fetchJobs();
        } catch (error) {
            console.error("Error creating job:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job post?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:4000/api/placements/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchJobs();
        } catch (error) {
            console.error("Error deleting job:", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Placements</h1>
                {isCoordinator && (
                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Job Post
                    </button>
                )}
            </div>

            {isCoordinator && showCreate && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Create New Job Post</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Job Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Company Name</label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Minimum CGPA</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.minCgpa}
                                    onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.requiresVerifiedProject}
                                onChange={(e) => setFormData({ ...formData, requiresVerifiedProject: e.target.checked })}
                                className="mr-2"
                            />
                            <label className="text-sm text-gray-700">Requires Verified Project</label>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {jobs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No job posts available</p>
                ) : (
                    jobs.map((job) => (
                        <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-blue-600">{job.title}</h2>
                                    <p className="text-gray-700 font-medium">{job.company.name}</p>
                                    <p className="text-gray-600 mt-2">{job.description}</p>
                                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                        {job.minCgpa && <span>Min CGPA: {job.minCgpa}</span>}
                                        {job.requiresVerifiedProject && <span className="text-orange-600">Requires Verified Project</span>}
                                        <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
                                        {job.expiresAt && (
                                            <span className="text-red-600">
                                                Expires: {new Date(job.expiresAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {isCoordinator ? (
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    ) : (
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            Apply
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Placements;
