import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Form, Table } from "react-bootstrap";
import { toast } from "react-toastify";

import {
    createFAQ,
    getAllFAQs,
    hideFAQ,
    updateFAQ
} from "../../services/faqService";

const emptyForm = {
    question: "",
    answer: "",
    category: "General",
    isPublished: true
};

function getFaqId(faq) {
    return faq.faqId ?? faq.faqID ?? faq.faqid;
}

function HelpContentManager() {
    const [faqs, setFaqs] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState("");

    const loadFAQs = useCallback(async () => {
        setLoading(true);
        setLoadError("");

        try {
            const response = await getAllFAQs();
            setFaqs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                (typeof error.response?.data === "string"
                    ? error.response.data
                    : "Could not load Help Centre content.");
            setLoadError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFAQs();
    }, [loadFAQs]);

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const editFAQ = (faq) => {
        setEditingId(getFaqId(faq));
        setForm({
            question: faq.question || "",
            answer: faq.answer || "",
            category: faq.category || "General",
            isPublished: Boolean(faq.isPublished)
        });
    };

    const saveFAQ = async (event) => {
        event.preventDefault();

        if (!form.question.trim() || !form.answer.trim()) {
            toast.error("Enter both a question and an answer.");
            return;
        }

        setSaving(true);
        const payload = {
            question: form.question.trim(),
            answer: form.answer.trim(),
            category: form.category.trim() || "General",
            isPublished: form.isPublished
        };

        try {
            if (editingId) {
                await updateFAQ(editingId, payload);
                toast.success("Help content updated.");
            } else {
                await createFAQ(payload);
                toast.success("Help content added.");
            }

            resetForm();
            await loadFAQs();
        } catch (error) {
            const responseData = error.response?.data;
            const message =
                typeof responseData === "string"
                    ? responseData
                    : responseData?.message || "Could not save Help Centre content.";
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const togglePublished = async (faq) => {
        const faqId = getFaqId(faq);
        try {
            if (faq.isPublished) {
                await hideFAQ(faqId);
                toast.success("FAQ hidden from users and the AI assistant.");
            } else {
                await updateFAQ(faqId, {
                    question: faq.question,
                    answer: faq.answer,
                    category: faq.category || "General",
                    isPublished: true
                });
                toast.success("FAQ published for users and the AI assistant.");
            }
            await loadFAQs();
        } catch (error) {
            const responseData = error.response?.data;
            const message =
                typeof responseData === "string"
                    ? responseData
                    : responseData?.message || "Could not update FAQ publication.";
            toast.error(message);
        }
    };

    return (
        <section className="panel table-panel">
            <div className="panel-heading">
                <div>
                    <h2>Help Centre Content</h2>
                </div>
                {!editingId && (
                    <Button onClick={resetForm}>+ Add question</Button>
                )}
            </div>

            {(editingId || form.question || form.answer || faqs.length === 0) && (
                <Form onSubmit={saveFAQ} className="mb-4">
                    <Form.Group className="mb-3">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            required
                            maxLength={200}
                            value={form.question}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    question: event.target.value
                                }))
                            }
                            placeholder="Enter the user's question"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Answer</Form.Label>
                        <Form.Control
                            as="textarea"
                            required
                            rows={4}
                            maxLength={5000}
                            value={form.answer}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    answer: event.target.value
                                }))
                            }
                            placeholder="Enter the approved answer"
                        />
                    </Form.Group>

                    <div className="d-flex flex-wrap align-items-end gap-3">
                        <Form.Group className="flex-grow-1">
                            <Form.Label>Category</Form.Label>
                            <Form.Control
                                maxLength={80}
                                value={form.category}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        category: event.target.value
                                    }))
                                }
                                placeholder="General"
                            />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            id="faq-is-published"
                            label="Published"
                            checked={form.isPublished}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    isPublished: event.target.checked
                                }))
                            }
                        />
                    </div>

                    <div className="d-flex gap-2 mt-3">
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving…" : editingId ? "Save changes" : "Add question"}
                        </Button>
                        {editingId && (
                            <Button
                                type="button"
                                variant="outline-secondary"
                                disabled={saving}
                                onClick={resetForm}
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </Form>
            )}

            {loadError && (
                <div role="alert" className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2">
                    <span>{loadError}</span>
                    <Button variant="outline-danger" size="sm" onClick={loadFAQs}>
                        Try again
                    </Button>
                </div>
            )}

            {loading ? (
                <p role="status" className="text-muted">Loading FAQs…</p>
            ) : faqs.length === 0 ? (
                <p className="text-muted">No FAQs have been added yet.</p>
            ) : (
                <Table responsive hover>
                    <thead>
                        <tr>
                            <th>Question</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.map((faq) => (
                            <tr key={getFaqId(faq)}>
                                <td>
                                    <div className="fw-semibold">{faq.question}</div>
                                    <div className="small text-muted text-break">
                                        {faq.answer}
                                    </div>
                                </td>
                                <td>{faq.category || "General"}</td>
                                <td>
                                    <Badge bg={faq.isPublished ? "success" : "secondary"}>
                                        {faq.isPublished ? "Published" : "Hidden"}
                                    </Badge>
                                </td>
                                <td>
                                    <div className="d-flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => editFAQ(faq)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={faq.isPublished ? "outline-danger" : "outline-success"}
                                            onClick={() => togglePublished(faq)}
                                        >
                                            {faq.isPublished ? "Hide" : "Publish"}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </section>
    );
}

export default HelpContentManager;
