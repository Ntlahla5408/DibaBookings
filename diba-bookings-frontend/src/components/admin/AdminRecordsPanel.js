import { Badge, Button, Form, Table } from "react-bootstrap";
import { formatDate } from "../../utils/dateUtils";
import { shortId } from "../../utils/dashboardUtils";

const sectionTitles = {
    users: ["USER MANAGEMENT", "Users"],
    bookings: ["BOOKING OVERSIGHT", "All bookings"],
    audit: ["ACCOUNTABILITY", "Audit logs"]
};

function EmptyTableRow({ colSpan, children }) {
    return (
        <tr>
            <td colSpan={colSpan} className="text-center text-muted py-4">
                {children}
            </td>
        </tr>
    );
}

function AdminRecordsPanel({
    activeSection,
    query,
    onQueryChange,
    users,
    allUsers,
    roles,
    userStatusFilter,
    onUserStatusFilterChange,
    userRoleFilter,
    onUserRoleFilterChange,
    onClearUserFilters,
    bookings,
    logs,
    onCreateUser,
    onChangeRole,
    onUpdateUser
}) {
    const [eyebrow, title] = sectionTitles[activeSection];
    const activeUsers = allUsers.filter((user) => user.isActive).length;
    const inactiveUsers = allUsers.length - activeUsers;
    const userFiltersChanged =
        query.trim() !== "" ||
        userStatusFilter !== "all" ||
        userRoleFilter !== "all";

    return (
        <section className="panel table-panel">
            <div className="panel-heading">
                <div>
                    <p className="eyebrow">{eyebrow}</p>
                    <h2>{title}</h2>
                </div>
                {activeSection === "users" && (
                    <Button onClick={onCreateUser}>+ Create user</Button>
                )}
            </div>

            {activeSection !== "audit" && (
                <Form.Control
                    className="search"
                    placeholder={`Search ${activeSection}...`}
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    aria-label={`Search ${activeSection}`}
                />
            )}

            {activeSection === "users" && (
                <>
                    <div className="admin-user-summary" aria-label="User account totals">
                        <span><strong>{allUsers.length}</strong> total</span>
                        <span><strong>{activeUsers}</strong> active</span>
                        <span><strong>{inactiveUsers}</strong> inactive</span>
                    </div>

                    <div className="admin-filter-row">
                        <Form.Group className="admin-filter-field">
                            <Form.Label>Account status</Form.Label>
                            <Form.Select
                                value={userStatusFilter}
                                onChange={(event) => onUserStatusFilterChange(event.target.value)}
                                aria-label="Filter users by account status"
                            >
                                <option value="all">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="admin-filter-field">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={userRoleFilter}
                                onChange={(event) => onUserRoleFilterChange(event.target.value)}
                                aria-label="Filter users by role"
                            >
                                <option value="all">All roles</option>
                                {roles.map((role) => (
                                    <option key={role.roleId} value={role.roleName}>
                                        {role.roleName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <div className="admin-filter-actions">
                            <span className="text-muted small">
                                Showing {users.length} of {allUsers.length} users
                            </span>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={onClearUserFilters}
                                disabled={!userFiltersChanged}
                            >
                                Clear filters
                            </Button>
                        </div>
                    </div>

                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <EmptyTableRow colSpan={5}>
                                    No users match these filters. Try changing the search or clearing the filters.
                                </EmptyTableRow>
                            ) : users.map((user) => (
                                <tr key={user.userId}>
                                    <td>{user.firstName} {user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <Badge bg={user.isActive ? "success" : "secondary"}>
                                            {user.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td>
                                        <button
                                            className="table-action"
                                            onClick={() => onChangeRole(user)}
                                        >
                                            Change role
                                        </button>
                                        <button
                                            className="table-action danger"
                                            onClick={() => onUpdateUser(user)}
                                        >
                                            {user.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            {activeSection === "bookings" && (
                <>
                    <p className="text-muted small">
                        Showing {bookings.length} matching booking{bookings.length === 1 ? "" : "s"}
                    </p>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Booking</th>
                                <th>Organiser</th>
                                <th>Event</th>
                                <th>Venue</th>
                                <th>Submitted</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <EmptyTableRow colSpan={6}>
                                    No bookings match your search.
                                </EmptyTableRow>
                            ) : bookings.map((booking) => (
                                <tr key={booking.bookingId}>
                                    <td>{shortId(booking.bookingId)}</td>
                                    <td>{booking.organiserName || shortId(booking.userId)}</td>
                                    <td>{booking.eventName || shortId(booking.eventId)}</td>
                                    <td>{booking.venueName || shortId(booking.venueId)}</td>
                                    <td>{formatDate(booking.bookingDate)}</td>
                                    <td>
                                        <Badge bg="light" text="dark">
                                            {booking.statusName || shortId(booking.bookingStatusId)}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            {activeSection === "audit" && (
                <Table responsive hover>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Performed by</th>
                            <th>Date / time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <EmptyTableRow colSpan={4}>No audit records are available.</EmptyTableRow>
                        ) : logs.map((log) => (
                            <tr key={log.auditLogId}>
                                <td><strong>{log.action}</strong></td>
                                <td>{log.logDescription || "-"}</td>
                                <td>{log.userName || shortId(log.userId)}</td>
                                <td>{formatDate(log.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </section>
    );
}

export default AdminRecordsPanel;
