import { useEffect, useRef, useState } from "react";
import { askDibaAssistant } from "../../services/assistantService";
import "./DibaAssistantWidget.css";

function DibaAssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([
        {
            id: "welcome",
            role: "assistant",
            text: "Hello! Ask me about using DIBA Bookings. I answer from published help information."
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [isOpen, messages, isLoading]);

    async function handleSubmit(event) {
        event.preventDefault();
        const trimmedQuestion = question.trim();

        if (!trimmedQuestion || isLoading) return;

        setMessages((current) => [
            ...current,
            { id: `user-${Date.now()}`, role: "user", text: trimmedQuestion }
        ]);
        setQuestion("");
        setIsLoading(true);
        setError("");

        try {
            const result = await askDibaAssistant(trimmedQuestion);
            setMessages((current) => [
                ...current,
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    text: result?.answer || "I couldn't confirm that. Please contact conference centre staff."
                }
            ]);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "The assistant is temporarily unavailable. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="diba-assistant-widget">
            {isOpen && (
                <section className="diba-assistant-panel" aria-label="DIBA AI Assistant">
                    <header className="diba-assistant-header">
                        <div>
                            <strong>DIBA AI Assistant</strong>
                            <span>Booking help</span>
                        </div>
                        <button type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">×</button>
                    </header>

                    <div className="diba-assistant-messages" aria-live="polite">
                        {messages.map((message) => (
                            <div className={`diba-assistant-message ${message.role}`} key={message.id}>
                                {message.text}
                            </div>
                        ))}
                        {isLoading && <div className="diba-assistant-message assistant">Thinking…</div>}
                        {error && <p className="diba-assistant-error" role="alert">{error}</p>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="diba-assistant-form" onSubmit={handleSubmit}>
                        <textarea
                            value={question}
                            onChange={(event) => setQuestion(event.target.value)}
                            placeholder="Ask a question…"
                            aria-label="Ask DIBA AI Assistant a question"
                            maxLength={1000}
                            rows={2}
                            disabled={isLoading}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                        />
                        <button type="submit" disabled={isLoading || !question.trim()}>Send</button>
                    </form>
                </section>
            )}

            <button
                type="button"
                className="diba-assistant-launcher"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((current) => !current)}
            >
                <span aria-hidden="true">✦</span> Ask DibaAIAssistant
            </button>
        </div>
    );
}

export default DibaAssistantWidget;
