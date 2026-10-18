import { Button, Form, Modal } from "react-bootstrap";

function ChangeUserRoleModal({
    show,
    user,
    roles,
    selectedRoleId,
    onRoleChange,
    onHide,
    onSubmit,
    saving
}) {
    if (!user) return null;

    const currentRole = user.role || "Unknown";
    const selectedRole = roles.find(
        (role) => String(role.roleId) === String(selectedRoleId)
    );
    const isUnchanged =
        selectedRole && selectedRole.roleName.toLowerCase() === currentRole.toLowerCase();

    return (
        <Modal show={show} onHide={saving ? undefined : onHide} centered>
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton={!saving}>
                    <Modal.Title>Change user role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="rounded border p-3 mb-3">
                        <p className="small text-muted mb-1">Selected user</p>
                        <h5 className="mb-1">{user.firstName} {user.lastName}</h5>
                        <div className="text-muted">{user.email}</div>
                        <div className="small mt-2">User ID: {user.userId}</div>
                        <div className="mt-2">
                            <span className="text-muted">Current role: </span>
                            <strong>{currentRole}</strong>
                        </div>
                        <div className="mt-1">
                            <span className="text-muted">Account status: </span>
                            <strong>{user.isActive ? "Active" : "Inactive"}</strong>
                        </div>
                    </div>

                    <Form.Group controlId="newUserRole">
                        <Form.Label>New role</Form.Label>
                        <Form.Select
                            value={selectedRoleId}
                            onChange={(event) => onRoleChange(event.target.value)}
                            required
                            disabled={saving}
                        >
                            <option value="" disabled>Select a role</option>
                            {roles.map((role) => (
                                <option key={role.roleId} value={role.roleId}>
                                    {role.roleName}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Text muted>
                            Changing a role changes the permissions available to this account.
                        </Form.Text>
                    </Form.Group>

                    {selectedRole && !isUnchanged && (
                        <div className="alert alert-warning mt-3 mb-0" role="alert">
                            You are changing this user's role from <strong>{currentRole}</strong> to{" "}
                            <strong>{selectedRole.roleName}</strong>. Check the selected user and role before saving.
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving || !selectedRole || isUnchanged}>
                        {saving ? "Saving..." : "Save role"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ChangeUserRoleModal;
