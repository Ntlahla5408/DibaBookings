import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";

const ticketStatuses = ["Open", "In Progress", "Waiting for User", "Resolved", "Closed"];

function getError(error, fallback) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    return fallback;
}

function SupportTicketsPanel({ staffMode = false }) {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ subject: "", category: "General", description: "" });
    const [responses, setResponses] = useState({});

    const loadTickets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get("/SupportTickets");
            setTickets(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error(getError(error, "Could not load support tickets."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadTickets(); }, [loadTickets]);

    const createTicket = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.post("/SupportTickets", {
                subject: form.subject.trim(),
                category: form.category,
                description: form.description.trim()
            });
            toast.success("Support ticket submitted.");
            setForm({ subject: "", category: "General", description: "" });
            await loadTickets();
        } catch (error) {
            toast.error(getError(error, "Could not submit the support ticket."));
        } finally {
            setSaving(false);
        }
    };

    const saveResponse = async (ticket) => {
        const draft = responses[ticket.supportTicketId] || {};
        setSaving(true);
        try {
            await api.put(`/SupportTickets/${ticket.supportTicketId}/respond`, {
                status: draft.status || ticket.status || "In Progress",
                staffResponse: draft.staffResponse ?? ticket.staffResponse ?? ""
            });
            toast.success("Ticket response and status updated.");
            await loadTickets();
        } catch (error) {
            toast.error(getError(error, "Could not update the support ticket."));
        } finally {
            setSaving(false);
        }
    };

    const statusVariant = (status) => {
        if (status === "Resolved" || status === "Closed") return "success";
        if (status === "In Progress") return "primary";
        if (status === "Waiting for User") return "warning";
        return "secondary";
    };

    return (
        <section className="diba-feature-panel" aria-labelledby="support-tickets-title">
            <h2 id="support-tickets-title" className="mb-3">{staffMode ? "Support Ticket Queue" : "My Support Tickets"}</h2>

            {!staffMode && (
                <div className="border rounded p-3 mb-4">
                    <h3 className="h5">Create a support request</h3>
                    <Form onSubmit={createTicket}>
                        <Form.Group className="mb-3">
                            <Form.Label>Subject</Form.Label>
                            <Form.Control maxLength={200} value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category</Form.Label>
                            <Form.Select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                                <option>General</option>
                                <option>Booking</option>
                                <option>Venue</option>
                                <option>Payment</option>
                                <option>Technical issue</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Describe the issue</Form.Label>
                            <Form.Control as="textarea" rows={4} maxLength={5000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
                        </Form.Group>
                        <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit ticket"}</Button>
                    </Form>
                </div>
            )}

            {loading && <p role="status">Loading support tickets…</p>}
            {!loading && tickets.length === 0 && <p className="text-muted">{staffMode ? "There are no support tickets to review." : "You have not submitted any support tickets."}</p>}

            {!loading && tickets.length > 0 && (
                <div className="d-grid gap-3">
                    {tickets.map((ticket) => {
                        const draft = responses[ticket.supportTicketId] || {};
                        return (
                            <article className="border rounded p-3" key={ticket.supportTicketId}>
                                <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                                    <div>
                                        <h3 className="h5 mb-1">{ticket.subject}</h3>
                                        <p className="small text-muted mb-2">{ticket.ticketNumber} · {ticket.category} · Submitted {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "date unavailable"}</p>
                                        {staffMode && <p className="small mb-2"><strong>Organiser:</strong> {ticket.userName || ticket.userId || "Unknown user"}</p>}
                                    </div>
                                    <Badge bg={statusVariant(ticket.status)}>{ticket.status || "Open"}</Badge>
                                </div>
                                <p className="mb-3" style={{ whiteSpace: "pre-wrap" }}>{ticket.description}</p>
                                {ticket.staffResponse && (
                                    <div className="rounded p-3 mb-3" style={{ background: "#f2f6f9" }}>
                                        <strong>Staff response</strong>
                                        <p className="mb-1 mt-1" style={{ whiteSpace: "pre-wrap" }}>{ticket.staffResponse}</p>
                                        {ticket.respondedAt && <small className="text-muted">{new Date(ticket.respondedAt).toLocaleString()}</small>}
                                    </div>
                                )}
                                {staffMode && (
                                    <div className="border-top pt-3">
                                        <Form.Group className="mb-3">
                                            <Form.Label>Response to organiser</Form.Label>
                                            <Form.Control as="textarea" rows={3} maxLength={5000} value={draft.staffResponse ?? ticket.staffResponse ?? ""} onChange={(event) => setResponses((current) => ({ ...current, [ticket.supportTicketId]: { ...current[ticket.supportTicketId], staffResponse: event.target.value } }))} placeholder="Write a response or update…" />
                                        </Form.Group>
                                        <div className="d-flex flex-wrap gap-2 align-items-end">
                                            <Form.Group>
                                                <Form.Label>Status</Form.Label>
                                                <Form.Select value={draft.status || ticket.status || "Open"} onChange={(event) => setResponses((current) => ({ ...current, [ticket.supportTicketId]: { ...current[ticket.supportTicketId], status: event.target.value } }))}>
                                                    {ticketStatuses.map((status) => <option key={status}>{status}</option>)}
                                                </Form.Select>
                                            </Form.Group>
                                            <Button type="button" disabled={saving} onClick={() => saveResponse(ticket)}>{saving ? "Saving…" : "Save response"}</Button>
                                        </div>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default SupportTicketsPanel;
