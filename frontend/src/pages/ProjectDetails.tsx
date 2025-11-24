import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { MessageSquare } from "lucide-react";

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get(`http://localhost:4000/api/projects/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProject(data);
            } catch (error) {
                console.error("Error fetching project:", error);
            }
        };

        fetchProject();
    }, [id]);

    if (!project) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <p className="text-gray-600">{project.description}</p>
                </div>
                <Link
                    to={`/chat/projects/${project.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
                >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Project Chat
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Details</h2>
                    <div className="space-y-2">
                        <p><span className="font-medium">Type:</span> {project.type}</p>
                        <p><span className="font-medium">Visibility:</span> {project.visibility}</p>
                        <p><span className="font-medium">Owner:</span> {project.owner.displayName}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Team Members</h2>
                    <ul className="space-y-2">
                        {project.members.map((member: any) => (
                            <li key={member.userId} className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                    {member.user.displayName[0]}
                                </div>
                                <span>{member.user.displayName}</span>
                                {member.isOwner && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Owner</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
