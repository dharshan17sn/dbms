import { useEffect, useState } from "react";
import axios from "axios";
import { Users } from "lucide-react";

interface Friend {
    id: string;
    displayName: string;
    email: string;
}

const MyFriends = () => {
    const [friends, setFriends] = useState<Friend[]>([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const token = localStorage.getItem("token");
                const { data } = await axios.get("http://localhost:4000/api/friends", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFriends(data);
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };

        fetchFriends();
    }, []);

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.length === 0 ? (
                    <p className="text-gray-500 col-span-full text-center py-8">
                        No friends yet. Connect with people through projects!
                    </p>
                ) : (
                    friends.map((friend) => (
                        <div key={friend.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{friend.displayName}</h3>
                                    <p className="text-sm text-gray-500">{friend.email}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyFriends;
