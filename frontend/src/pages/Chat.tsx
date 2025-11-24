import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Send } from "lucide-react";

interface Message {
    id: string;
    content: string;
    sender: { displayName: string; id: string };
    createdAt: string;
}

interface ChatProps {
    type: "IDEA" | "PROJECT";
}

const Chat = ({ type }: ChatProps) => {
    const { projectId } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) setCurrentUser(JSON.parse(user));
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem("token");
            const endpoint = type === "IDEA"
                ? "http://localhost:4000/api/chat/ideas"
                : `http://localhost:4000/api/chat/projects/${projectId}`;

            const { data } = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [type, projectId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "http://localhost:4000/api/chat",
                { content: newMessage, type, projectId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewMessage("");
            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">
                    {type === "IDEA" ? "Idea Discussion" : "Project Chat"}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isOwn = msg.sender.id === currentUser?.id;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${isOwn
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                    }`}
                            >
                                {!isOwn && (
                                    <p className="text-xs font-semibold mb-1">{msg.sender.displayName}</p>
                                )}
                                <p>{msg.content}</p>
                                <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default Chat;
