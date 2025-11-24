import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, MessageSquare, User, LogOut, Briefcase, Bell, Users, Lightbulb } from "lucide-react";

const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
    };

    // Get user role from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "STUDENT";

    // Define all navigation items with role restrictions
    const allNavItems = [
        { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["STUDENT"] },
        { path: "/placements", icon: Briefcase, label: "Placements", roles: ["STUDENT", "PLACEMENT_ADMIN"] },
        { path: "/notifications", icon: Bell, label: "Notifications", roles: ["STUDENT", "MENTOR", "PLACEMENT_ADMIN"] },
        { path: "/network", icon: Users, label: "My Network", roles: ["STUDENT"] },
        { path: "/profile", icon: User, label: "Profile", roles: ["STUDENT", "MENTOR", "PLACEMENT_ADMIN"] },
    ];

    // Filter navigation items based on user role
    const navItems = allNavItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">StudentHub</h1>
                </div>
                <nav className="mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${location.pathname.startsWith(item.path) ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : ""
                                }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 mt-auto"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
