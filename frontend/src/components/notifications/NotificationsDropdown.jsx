import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserNotifications, markAsRead, markAllAsRead } from "../../services/notification.service";

const NotificationsDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        await Promise.resolve();
        try {
            setLoading(true);
            const data = await getUserNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchNotifications();
        };
        load();
    }, [fetchNotifications]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
            fetchNotifications(); // Refresh when opening
        }
    };

    const handleMarkAsRead = async (notification) => {
        if (!notification.isRead) {
            try {
                await markAsRead(notification._id);
                setUnreadCount((prev) => Math.max(0, prev - 1));
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
                );
            } catch (err) {
                console.error("Failed to mark notification as read", err);
            }
        }
        setIsOpen(false);

        // Navigate
        if (notification.type === "expense_added" || notification.type === "expense_edited") {
            navigate(`/groups/${notification.group}/expenses`);
        } else if (notification.type === "settlement_recorded" || notification.type === "debt_reminder") {
            navigate(`/groups/${notification.group}/settlements`);
        } else {
            navigate(`/groups/${notification.group}`);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleDropdown}
                className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900 z-50">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500">
                                No notifications yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification._id}
                                        onClick={() => handleMarkAsRead(notification)}
                                        className={`w-full text-left p-4 transition-colors ${
                                            notification.isRead
                                                ? "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                : "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/20"
                                        }`}
                                    >
                                        <p className={`text-sm ${notification.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-200 font-medium"}`}>
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                            {new Date(notification.updatedAt).toLocaleString()}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
