import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import AdminOverviewPanel from "../../components/admin/AdminOverviewPanel";
import AdminRecordsPanel from "../../components/admin/AdminRecordsPanel";
import ChangeUserRoleModal from "../../components/admin/ChangeUserRoleModal";
import CreateUserModal from "../../components/admin/CreateUserModal";
import DashboardShell from "../../components/common/DashboardShell";
import HelpContentManager from "../../components/common/HelpContentManager";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import ProfilePage from "../../components/common/ProfilePage";
import {
    createUser,
    getAdminOverview,
    getAuditLogs,
    getRoles,
    getUsers,
    updateUserRole,
    updateUserStatus
} from "../../services/adminService";
import { getBookings } from "../../services/bookingService";
import { emptyOverview } from "../../utils/dashboardUtils";
import { clearSession } from "../../utils/sessionUtils";

function AdminDashboard() {
    const [overview, setOverview] = useState(emptyOverview);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [logs, setLogs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [query, setQuery] = useState("");
    const [userStatusFilter, setUserStatusFilter] = useState("all");
    const [userRoleFilter, setUserRoleFilter] = useState("all");
    const [activeSection, setActiveSection] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [userForRoleChange, setUserForRoleChange] = useState(null);
    const [selectedRoleId, setSelectedRoleId] = useState("");
    const [savingRole, setSavingRole] = useState(false);
    const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roleId: ""
    });
    const firstName = localStorage.getItem("firstName") || "Administrator";

    const loadData = async () => {
        setLoading(true);
        try {
            const [
                summary,
                userResponse,
                bookingResponse,
                logResponse,
                roleResponse
            ] = await Promise.all([
                getAdminOverview(),
                getUsers(),
                getBookings(),
                getAuditLogs(),
                getRoles()
            ]);
            setOverview(summary.data);
            setUsers(userResponse.data);
            setBookings(bookingResponse.data);
            setLogs(logResponse.data);
            setRoles(roleResponse.data);
            setNewUser((current) => ({
                ...current,
                roleId:
                    current.roleId || roleResponse.data[0]?.roleId || ""
            }));
        } catch (error) {
            toast.error(
                error.response?.data || "Could not load administrator data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Keep payment status current in the administrator's booking records.
    useEffect(() => {
        const refreshBookings = async () => {
            try {
                const response = await getBookings();
                if (Array.isArray(response.data)) {
                    setBookings(response.data);
                }
            } catch {
                // Preserve the last successful result if the API is temporarily unavailable.
            }
        };

        const intervalId = window.setInterval(refreshBookings, 8000);
        return () => window.clearInterval(intervalId);
    }, []);

    const filteredUsers = useMemo(
        () =>
            users.filter((user) => {
                const matchesQuery =
                    `${user.firstName} ${user.lastName} ${user.email} ${user.role}`
                        .toLowerCase()
                        .includes(query.trim().toLowerCase());
                const matchesStatus =
                    userStatusFilter === "all" ||
                    (userStatusFilter === "active" && user.isActive) ||
                    (userStatusFilter === "inactive" && !user.isActive);
                const matchesRole =
                    userRoleFilter === "all" ||
                    String(user.role || "").toLowerCase() === userRoleFilter.toLowerCase();

                return matchesQuery && matchesStatus && matchesRole;
            }),
        [users, query, userStatusFilter, userRoleFilter]
    );

    const filteredBookings = useMemo(
        () =>
            bookings.filter((booking) =>
                `${booking.bookingId} ${booking.organiserName} ${booking.eventName} ${booking.venueName}`
                    .toLowerCase()
                    .includes(query.toLowerCase())
            ),
        [bookings, query]
    );

    const filteredLogs = useMemo(
        () =>
            logs.filter((log) =>
                `${log.action} ${log.logDescription || ""} ${log.userName || ""} ${log.timestamp || ""}`
                    .toLowerCase()
                    .includes(query.trim().toLowerCase())
            ),
        [logs, query]
    );

    const updateUser = async (user) => {
        try {
            await updateUserStatus(user.userId, !user.isActive);
            toast.success(
                `User ${user.isActive ? "deactivated" : "activated"}.`
            );
            loadData();
        } catch (error) {
            toast.error(error.response?.data || "Could not update user status.");
        }
    };

    const changeRole = (user) => {
        const currentRole = roles.find(
            (role) => role.roleName.toLowerCase() === String(user.role || "").toLowerCase()
        );
        setUserForRoleChange(user);
        setSelectedRoleId(String(currentRole?.roleId ?? ""));
    };

    const submitRoleChange = async (event) => {
        event.preventDefault();
        if (!userForRoleChange || !selectedRoleId) return;

        setSavingRole(true);
        try {
            await updateUserRole(userForRoleChange.userId, selectedRoleId);
            toast.success(`Role updated for ${userForRoleChange.firstName} ${userForRoleChange.lastName}.`);
            setUserForRoleChange(null);
            setSelectedRoleId("");
            await loadData();
        } catch (error) {
            toast.error(error.response?.data || "Could not update role.");
        } finally {
            setSavingRole(false);
        }
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();
        try {
            await createUser(newUser);
            toast.success("User created.");
            setShowCreate(false);
            setNewUser({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                roleId: roles[0]?.roleId || ""
            });
            loadData();
        } catch (error) {
            toast.error(error.response?.data || "Could not create user.");
        }
    };

    const updateNewUserField = (field, value) => {
        setNewUser((current) => ({
            ...current,
            [field]: value
        }));
    };

    return (
        <DashboardShell
            title={`Good morning, ${firstName}`}
            onLogout={clearSession}
            profileLabel={firstName}
            onProfileClick={() => setActiveSection("profile")}
            navigationItems={[
                { label: "Overview", onClick: () => setActiveSection("overview") },
                { label: "Users", onClick: () => setActiveSection("users") },
                { label: "Bookings", onClick: () => setActiveSection("bookings") },
                { label: "Audit logs", onClick: () => setActiveSection("audit") },
                { label: "Help content", onClick: () => setActiveSection("help") },
            ]}
        >

            {activeSection === "profile" ? (
                <ProfilePage />
            ) : loading ? (
                <LoadingIndicator label="Loading control room" />
            ) : activeSection === "overview" ? (
                <AdminOverviewPanel
                    overview={overview}
                    onShowAudit={() => setActiveSection("audit")}
                    onShowBookings={() => setActiveSection("bookings")}
                />
            ) : activeSection === "help" ? (
                <HelpContentManager />
            ) : (
                <AdminRecordsPanel
                    activeSection={activeSection}
                    query={query}
                    onQueryChange={setQuery}
                    users={filteredUsers}
                    allUsers={users}
                    roles={roles}
                    userStatusFilter={userStatusFilter}
                    onUserStatusFilterChange={setUserStatusFilter}
                    userRoleFilter={userRoleFilter}
                    onUserRoleFilterChange={setUserRoleFilter}
                    onClearUserFilters={() => {
                        setQuery("");
                        setUserStatusFilter("all");
                        setUserRoleFilter("all");
                    }}
                    bookings={filteredBookings}
                    logs={filteredLogs}
                    onCreateUser={() => setShowCreate(true)}
                    onChangeRole={changeRole}
                    onUpdateUser={updateUser}
                />
            )}

            <CreateUserModal
                show={showCreate}
                onHide={() => setShowCreate(false)}
                newUser={newUser}
                onChange={updateNewUserField}
                roles={roles}
                onSubmit={handleCreateUser}
            />

            <ChangeUserRoleModal
                show={Boolean(userForRoleChange)}
                user={userForRoleChange}
                roles={roles}
                selectedRoleId={selectedRoleId}
                onRoleChange={setSelectedRoleId}
                onHide={() => {
                    if (!savingRole) {
                        setUserForRoleChange(null);
                        setSelectedRoleId("");
                    }
                }}
                onSubmit={submitRoleChange}
                saving={savingRole}
            />
        </DashboardShell>
    );
}

export default AdminDashboard;
