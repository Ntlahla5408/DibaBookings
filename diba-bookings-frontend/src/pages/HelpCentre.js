import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedFAQs } from "../services/faqService";
import { askDibaAssistant } from "../services/assistantService";
import "./help-centre.css";

const suggestedQuestions = [
    "How do I make a venue booking?",
    "How can I check my booking status?",
    "What happens after I submit a booking?"
];

function HelpCentre() {
    const [faqs, setFaqs] = useState([]);
    const [faqLoading, setFaqLoading] = useState(true);
    const [faqError, setFaqError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [openFaqId, setOpenFaqId] = useState(null);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "assistant",
            text: "Hello! I can help with questions about DIBA Bookings using the published help information. What would you like to know?"
        }
    ]);
    const [assistantLoading, setAssistantLoading] = useState(false);
    const [assistantError, setAssistantError] = useState("");
    const messagesEndRef = useRef(null);

    const loadFAQs = useCallback(async () => {
        setFaqLoading(true);
        setFaqError("");

        try {
            const data = await getPublishedFAQs();
            setFaqs(Array.isArray(data) ? data : []);
        } catch {
            setFaqError("We couldn't load the help articles. Please try again.");
        } finally {
            setFaqLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFAQs();
    }, [loadFAQs]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, assistantLoading]);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(
            faqs.map((faq) => faq.category?.trim()).filter(Boolean)
        )];

        return ["All", ...uniqueCategories];
    }, [faqs]);

    const filteredFAQs = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return faqs.filter((faq) => {
            const matchesCategory = activeCategory === "All" ||
                faq.category === activeCategory;
            const searchableText = `${faq.question || ""} ${faq.answer || ""} ${faq.category || ""}`.toLowerCase();
            return matchesCategory && searchableText.includes(normalizedSearch);
        });
    }, [faqs, searchTerm, activeCategory]);

    async function handleAsk(event) {
        event.preventDefault();
        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || assistantLoading) {
            return;
        }

        const userMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            text: trimmedQuestion
        };

        setMessages((current) => [...current, userMessage]);
        setQuestion("");
        setAssistantLoading(true);
        setAssistantError("");

        try {
            const result = await askDibaAssistant(trimmedQuestion);
            const answer = typeof result?.answer === "string" && result.answer.trim()
                ? result.answer.trim()
                : "I couldn't find an answer to that just now. Please contact the conference centre staff.";

            setMessages((current) => [
                ...current,
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    text: answer
                }
            ]);
        } catch (error) {
            const message = error.response?.data?.message ||
                "The assistant is temporarily unavailable. Please try again in a moment.";
            setAssistantError(message);
        } finally {
            setAssistantLoading(false);
        }
    }

    function askSuggestedQuestion(suggestedQuestion) {
        setQuestion(suggestedQuestion);
    }

    return (
        <main className="help-centre-page">
            <header className="help-centre-header">
                <Link to="/" className="help-brand" aria-label="DIBA Bookings home">
                    <span className="help-brand-mark">D</span>
                    <span>DIBA <strong>Bookings</strong></span>
                </Link>
                <nav aria-label="Help centre navigation">
                    <Link to="/">Home</Link>
                    <Link to="/login">Log in</Link>
                </nav>
            </header>

            <section className="help-hero">
                <p className="help-eyebrow">DIBA BOOKINGS SUPPORT</p>
                <h1>How can we <em>help?</em></h1>
                <p>Find answers in the Help Centre or ask the DIBA assistant a question.</p>
                <label className="help-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search help articles..."
                        aria-label="Search help articles"
                    />
                </label>
            </section>

            <div className="help-centre-content">
                <section className="help-faq-section" aria-labelledby="help-faq-heading">
                    <div className="help-section-heading">
                        <div>
                            <p className="help-eyebrow">QUICK ANSWERS</p>
                            <h2 id="help-faq-heading">Frequently asked questions</h2>
                        </div>
                        <span className="help-result-count">{filteredFAQs.length} articles</span>
                    </div>

                    {!faqLoading && !faqError && categories.length > 1 && (
                        <div className="help-category-list" aria-label="Filter FAQs by category">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    className={activeCategory === category ? "active" : ""}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}

                    {faqLoading && (
                        <div className="help-state" role="status">Loading help articles…</div>
                    )}

                    {!faqLoading && faqError && (
                        <div className="help-state help-state-error" role="alert">
                            <p>{faqError}</p>
                            <button type="button" onClick={loadFAQs}>Try again</button>
                        </div>
                    )}

                    {!faqLoading && !faqError && filteredFAQs.length === 0 && (
                        <div className="help-state">
                            {faqs.length === 0
                                ? "Help articles haven't been published yet."
                                : "No articles match your search. Try a different word or category."}
                        </div>
                    )}

                    {!faqLoading && !faqError && filteredFAQs.length > 0 && (
                        <div className="help-faq-list">
                            {filteredFAQs.map((faq) => (
                                <article className="help-faq-item" key={faq.faqId}>
                                    <button
                                        type="button"
                                        className="help-faq-question"
                                        aria-expanded={openFaqId === faq.faqId}
                                        onClick={() => setOpenFaqId(
                                            openFaqId === faq.faqId ? null : faq.faqId
                                        )}
                                    >
                                        <span>{faq.question}</span>
                                        <span className="help-faq-toggle" aria-hidden="true">
                                            {openFaqId === faq.faqId ? "−" : "+"}
                                        </span>
                                    </button>
                                    {openFaqId === faq.faqId && (
                                        <div className="help-faq-answer">
                                            <p>{faq.answer}</p>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="help-assistant-card" aria-labelledby="assistant-heading">
                    <div className="assistant-card-heading">
                        <span className="assistant-symbol" aria-hidden="true">✦</span>
                        <div>
                            <p className="help-eyebrow">DIBA AI</p>
                            <h2 id="assistant-heading">Ask the assistant</h2>
                            <p>Get help using published booking information.</p>
                        </div>
                    </div>

                    <div className="assistant-suggestions">
                        <span>Try asking</span>
                        {suggestedQuestions.map((suggestion) => (
                            <button
                                type="button"
                                key={suggestion}
                                onClick={() => askSuggestedQuestion(suggestion)}
                                disabled={assistantLoading}
                            >
                                {suggestion}<span aria-hidden="true">↗</span>
                            </button>
                        ))}
                    </div>

                    <div className="assistant-chat" aria-label="Assistant conversation" aria-live="polite">
                        {messages.map((message) => (
                            <div
                                className={`assistant-message ${message.role === "user" ? "from-user" : "from-assistant"}`}
                                key={message.id}
                            >
                                <span>{message.role === "user" ? "You" : "DIBA Assistant"}</span>
                                <p>{message.text}</p>
                            </div>
                        ))}
                        {assistantLoading && (
                            <div className="assistant-message from-assistant" role="status">
                                <span>DIBA Assistant</span>
                                <p>Finding an answer…</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {assistantError && (
                        <p className="assistant-error" role="alert">{assistantError}</p>
                    )}

                    <form className="assistant-form" onSubmit={handleAsk}>
                        <label className="visually-hidden" htmlFor="assistant-question">Your question</label>
                        <textarea
                            id="assistant-question"
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            placeholder="Type your question…"
                            maxLength={1000}
                            rows={2}
                            disabled={assistantLoading}
                        />
                        <div className="assistant-form-footer">
                            <span>{question.length}/1000</span>
                            <button type="submit" disabled={!question.trim() || assistantLoading}>
                                {assistantLoading ? "Sending…" : "Ask"} <span aria-hidden="true">↑</span>
                            </button>
                        </div>
                    </form>
                    <p className="assistant-disclaimer">
                        The assistant may not know every detail. Confirm important information with conference centre staff.
                    </p>
                </aside>
            </div>

            <footer className="help-centre-footer">
                <span>© 2026 DIBA Bookings · Nelson Mandela University Conference Centre</span>
                <Link to="/">Back to DIBA Bookings</Link>
            </footer>
        </main>
    );
}

export default HelpCentre;
