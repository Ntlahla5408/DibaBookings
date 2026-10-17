import { useEffect, useState } from "react";
import { getPublishedFAQs } from "../services/faqService";
import "./help-centre.css";

function HelpCentre() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openFaqId, setOpenFaqId] = useState(null);

    async function loadFAQs() {
        setLoading(true);
        setError("");

        try {
            const response = await getPublishedFAQs();
            setFaqs(Array.isArray(response) ? response : []);
        } catch {
            setError("Could not load questions and answers. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFAQs();
    }, []);

    return (
        <section className="organizer-help-centre" aria-labelledby="organizer-help-title">
            <h2 id="organizer-help-title">Help Centre</h2>
            <p className="organizer-help-intro">Quick answers to common booking questions.</p>

            {loading && <p role="status">Loading questions…</p>}
            {!loading && error && (
                <div className="organizer-help-state" role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={loadFAQs}>Try again</button>
                </div>
            )}
            {!loading && !error && faqs.length === 0 && (
                <p className="organizer-help-state">No help questions have been published yet.</p>
            )}

            {!loading && !error && faqs.length > 0 && (
                <div className="organizer-faq-list">
                    {faqs.map((faq) => {
                        const faqId = faq.faqId ?? faq.faqID ?? faq.faqid ?? faq.question;
                        const isOpen = openFaqId === faqId;

                        return (
                            <article className="organizer-faq-item" key={faqId}>
                                <button
                                    type="button"
                                    className="organizer-faq-question"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpenFaqId(isOpen ? null : faqId)}
                                >
                                    <span>{faq.question}</span>
                                    <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                                </button>
                                {isOpen && <p className="organizer-faq-answer">{faq.answer}</p>}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default HelpCentre;
