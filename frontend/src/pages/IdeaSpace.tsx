import { useEffect, useState } from "react";
import axios from "axios";
import { Lightbulb, MessageCircle, Plus, Trash2 } from "lucide-react";

interface Idea {
    id: string;
    title: string;
    description: string;
    userId: string;
    createdAt: string;
    user: { id: string; displayName: string };
    _count: { comments: number };
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; displayName: string };
}

const IdeaSpace = () => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [commentText, setCommentText] = useState("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = user.id;

    const fetchIdeas = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/ideas", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIdeas(data);
        } catch (error) {
            console.error("Error fetching ideas:", error);
        }
    };

    useEffect(() => {
        fetchIdeas();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:4000/api/ideas",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowCreate(false);
            setFormData({ title: "", description: "" });
            fetchIdeas();
        } catch (error) {
            console.error("Error creating idea:", error);
        }
    };

    const fetchComments = async (ideaId: string) => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get(
                `http://localhost:4000/api/ideas/${ideaId}/comments`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleAddComment = async (ideaId: string) => {
        if (!commentText.trim()) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:4000/api/ideas/${ideaId}/comments`,
                { content: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCommentText("");
            fetchComments(ideaId);
            fetchIdeas(); // Refresh to update comment count
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const toggleComments = (ideaId: string) => {
        if (selectedIdea === ideaId) {
            setSelectedIdea(null);
            setComments([]);
        } else {
            setSelectedIdea(ideaId);
            fetchComments(ideaId);
        }
    };

    const handleDelete = async (ideaId: string) => {
        if (!confirm("Are you sure you want to delete this idea?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:4000/api/ideas/${ideaId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchIdeas();
        } catch (error) {
            console.error("Error deleting idea:", error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Idea Space</h1>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Share Idea
                </button>
            </div>

            {showCreate && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4">Share Your Idea</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                required
                            />
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
                                Share
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {ideas.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No ideas shared yet. Be the first!</p>
                ) : (
                    ideas.map((idea) => (
                        <div key={idea.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{idea.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                by {idea.user.displayName} • {new Date(idea.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {idea.userId === currentUserId && (
                                            <button
                                                onClick={() => handleDelete(idea.id)}
                                                className="bg-red-600 text-white px-3 py-1 rounded-md flex items-center hover:bg-red-700 text-sm"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mt-3">{idea.description}</p>

                                    <button
                                        onClick={() => toggleComments(idea.id)}
                                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mt-4"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        {idea._count.comments} Comments
                                    </button>

                                    {selectedIdea === idea.id && (
                                        <div className="mt-4 border-t pt-4">
                                            <div className="space-y-3 mb-4">
                                                {comments.map((comment) => (
                                                    <div key={comment.id} className="bg-gray-50 p-3 rounded">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {comment.user.displayName}
                                                        </p>
                                                        <p className="text-gray-700 mt-1">{comment.content}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    placeholder="Add a comment..."
                                                    className="flex-1 rounded-md border-gray-300 shadow-sm border p-2"
                                                />
                                                <button
                                                    onClick={() => handleAddComment(idea.id)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                >
                                                    Comment
                                                </button>
                                            </div>
                                        </div>
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

export default IdeaSpace;
