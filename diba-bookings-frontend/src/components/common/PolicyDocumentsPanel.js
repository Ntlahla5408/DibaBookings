import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";

function getError(error, fallback) {
    const data = error.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    return fallback;
}

function PolicyDocumentsPanel({ canManage = false }) {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [form, setForm] = useState({ policyType: "", title: "", content: "", isSamplePolicy: true });

    const loadPolicies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(canManage ? "/PolicyDocuments/manage" : "/PolicyDocuments");
            setPolicies(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error(getError(error, "Could not load policy documents."));
        } finally {
            setLoading(false);
        }
    }, [canManage]);

    useEffect(() => { loadPolicies(); }, [loadPolicies]);

    const startNewPolicy = () => {
        setForm({ policyType: "", title: "", content: "", isSamplePolicy: true });
        setShowEditor(true);
    };

    const startRevision = (policy) => {
        setForm({
            policyType: policy.policyType || "",
            title: policy.title || "",
            content: policy.content || "",
            isSamplePolicy: Boolean(policy.isSamplePolicy)
        });
        setShowEditor(true);
    };

    const savePolicy = async (event) => {
        event.preventDefault();
        if (!form.policyType.trim() || !form.title.trim() || !form.content.trim()) {
            toast.error("Policy type, title and full policy content are required.");
            return;
        }

        setSaving(true);
        try {
            await api.post("/PolicyDocuments", {
                policyType: form.policyType.trim(),
                title: form.title.trim(),
                content: form.content.trim(),
                isSamplePolicy: form.isSamplePolicy
            });
            toast.success("A new policy version has been published.");
            setShowEditor(false);
            await loadPolicies();
        } catch (error) {
            toast.error(getError(error, "Could not save the policy."));
        } finally {
            setSaving(false);
        }
    };

    const activePolicies = canManage
        ? policies.filter((policy) => policy.isActive)
        : policies;
    const historyPolicies = policies.filter((policy) => !policy.isActive);

    return (
        <section className="diba-feature-panel" aria-labelledby="policy-documents-title">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 id="policy-documents-title" className="mb-0">Policy Documents</h2>
                {canManage && <Button type="button" onClick={startNewPolicy}>Add policy</Button>}
            </div>

            {loading && <p role="status">Loading policies…</p>}
            {!loading && policies.length === 0 && (
                <p className="text-muted">No policy documents have been published yet.</p>
            )}

            {!loading && activePolicies.length > 0 && (
                <div className="d-grid gap-3">
                    {activePolicies.map((policy) => (
                        <article className="border rounded p-3" key={policy.policyDocumentId}>
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                                <div>
                                    <h3 className="h5 mb-1">{policy.title}</h3>
                                    <span className="text-muted small">{policy.policyType} · Version {policy.version}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    {policy.isSamplePolicy && <Badge bg="warning" text="dark">Sample — not official</Badge>}
                                    {canManage && <Button size="sm" variant="outline-primary" onClick={() => startRevision(policy)}>Publish revision</Button>}
                                </div>
                            </div>
                            <div className="policy-document-content" style={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{policy.content}</div>
                            <p className="small text-muted mt-3 mb-0">Updated {policy.updatedAt ? new Date(policy.updatedAt).toLocaleString() : "date unavailable"}</p>
                        </article>
                    ))}
                </div>
            )}

            {canManage && !loading && historyPolicies.length > 0 && (
                <details className="mt-4">
                    <summary className="fw-semibold">Revision history ({historyPolicies.length} previous versions)</summary>
                    <div className="d-grid gap-3 mt-3">
                        {historyPolicies.map((policy) => (
                            <article className="border rounded p-3 bg-light" key={policy.policyDocumentId}>
                                <div className="d-flex flex-wrap justify-content-between gap-2">
                                    <strong>{policy.title}</strong>
                                    <Badge bg="secondary">Version {policy.version}</Badge>
                                </div>
                                <p className="small text-muted mb-2">{policy.policyType} · Updated {policy.updatedAt ? new Date(policy.updatedAt).toLocaleString() : "date unavailable"}</p>
                                <div className="policy-document-content">{policy.content}</div>
                            </article>
                        ))}
                    </div>
                </details>
            )}

            {showEditor && canManage && (
                <div className="border rounded p-3 mt-4">
                    <h3 className="h5">{form.policyType ? "Publish policy revision" : "New policy"}</h3>
                    <Form onSubmit={savePolicy}>
                        <Form.Group className="mb-3">
                            <Form.Label>Policy type</Form.Label>
                            <Form.Control maxLength={60} value={form.policyType} onChange={(event) => setForm((current) => ({ ...current, policyType: event.target.value }))} placeholder="e.g. VenueRules" required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Policy title</Form.Label>
                            <Form.Control maxLength={200} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Full policy text</Form.Label>
                            <Form.Control as="textarea" rows={10} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} required />
                        </Form.Group>
                        <Form.Check className="mb-3" type="checkbox" label="Mark as sample policy (not yet officially confirmed)" checked={form.isSamplePolicy} onChange={(event) => setForm((current) => ({ ...current, isSamplePolicy: event.target.checked }))} />
                        <div className="d-flex gap-2">
                            <Button type="submit" disabled={saving}>{saving ? "Publishing…" : "Publish new version"}</Button>
                            <Button type="button" variant="outline-secondary" onClick={() => setShowEditor(false)} disabled={saving}>Cancel</Button>
                        </div>
                    </Form>
                </div>
            )}
        </section>
    );
}

export default PolicyDocumentsPanel;
