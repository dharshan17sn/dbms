import { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Check, X } from "lucide-react";

interface Notification {
    id: string;
    type: string;
    payload: any;
    read: boolean;
    createdAt: string;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/notifications", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.get("http://localhost:4000/api/friends/requests", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFriendRequests(data);
        } catch (error) {
            console.error("Error fetching friend requests:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        fetchFriendRequests();
    }, []);

    const handleAcceptFriend = async (requestId: string) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:4000/api/friends/requests/${requestId}/accept`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchFriendRequests();
            fetchNotifications();
        } catch (error) {
            console.error("Error accepting friend request:", error);
        }
    };

    const handleRejectFriend = async (requestId: string) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:4000/api/friends/requests/${requestId}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchFriendRequests();
        } catch (error) {
            console.error("Error rejecting friend request:", error);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Notifications</h1>

            {/* Friend Requests */}
            {friendRequests.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
                    <div className="space-y-4">
                        {friendRequests.map((request) => (
                            <div key={request.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{request.requester.displayName}</p>
                                    <p className="text-sm text-gray-500">{request.requester.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAcceptFriend(request.id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleRejectFriend(request.id)}
                                        className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Other Notifications */}
            <div>
                <h2 className="text-xl font-semibold mb-4">All Notifications</h2>
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No notifications</p>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-lg shadow-md flex items-start gap-3 ${notif.read ? "bg-gray-50" : "bg-blue-50"
                                    }`}
                            >
                                <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <p className="font-medium">
                                        {notif.type === "FRIEND_REQUEST" && "New friend request"}
                                        {notif.type === "FRIEND_REQUEST_ACCEPTED" && "Friend request accepted"}
                                        {notif.type === "TEAM_JOIN_REQUEST" && (
                                            <span>
                                                <strong>{notif.payload.requesterName}</strong> requested to join <strong>{notif.payload.projectTitle}</strong>
                                            </span>
                                        )}
                                        {notif.type === "TEAM_JOIN_ACCEPTED" && (
                                            <span>
                                                You have been accepted into <strong>{notif.payload.projectTitle}</strong>
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date(notif.createdAt).toLocaleString()}
                                    </p>

                                    {/* Action Buttons for Team Join Request */}
                                    {notif.type === "TEAM_JOIN_REQUEST" && (
                                        <div className="mt-3">
                                            {localStorage.getItem(`notification_action_${notif.id}`) ? (
                                                <span className={`text-sm font-medium ${localStorage.getItem(`notification_action_${notif.id}`) === "ACCEPTED"
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                    }`}>
                                                    {localStorage.getItem(`notification_action_${notif.id}`) === "ACCEPTED"
                                                        ? "Request Accepted"
                                                        : "Request Rejected"}
                                                </span>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const token = localStorage.getItem("token");
                                                                await axios.post(
                                                                    `http://localhost:4000/api/projects/${notif.payload.projectId}/join-requests/${notif.payload.joinRequestId}/accept`,
                                                                    {},
                                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                                );
                                                                localStorage.setItem(`notification_action_${notif.id}`, "ACCEPTED");
                                                                // Force re-render
                                                                setNotifications([...notifications]);
                                                            } catch (error) {
                                                                console.error("Error accepting request:", error);
                                                                alert("Failed to accept request");
                                                            }
                                                        }}
                                                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const token = localStorage.getItem("token");
                                                                await axios.post(
                                                                    `http://localhost:4000/api/projects/${notif.payload.projectId}/join-requests/${notif.payload.joinRequestId}/reject`,
                                                                    {},
                                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                                );
                                                                localStorage.setItem(`notification_action_${notif.id}`, "REJECTED");
                                                                // Force re-render
                                                                setNotifications([...notifications]);
                                                            } catch (error) {
                                                                console.error("Error rejecting request:", error);
                                                                alert("Failed to reject request");
                                                            }
                                                        }}
                                                        className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
