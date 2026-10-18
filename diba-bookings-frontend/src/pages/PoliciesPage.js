import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function PoliciesPage() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        api.get("/PolicyDocuments")
            .then((response) => {
                if (isMounted) setPolicies(Array.isArray(response.data) ? response.data : []);
            })
            .catch(() => {
                if (isMounted) setError("We couldn't load the current policies. Please try again later.");
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    return (
        <main className="policy-page">
            <header className="policy-page-header">
                <Link to="/" aria-label="DIBA Bookings home">DIBA Bookings</Link>
                <Link to="/dashboard">Back to dashboard</Link>
            </header>
            <section className="policy-page-content">
                <p className="policy-eyebrow">DIBA BOOKINGS</p>
                <h1>Terms and Conditions</h1>
                <p>Review the active policies and venue rules that apply when submitting a booking.</p>
                {loading && <p>Loading current policies…</p>}
                {error && <p role="alert">{error}</p>}
                {!loading && !error && policies.length === 0 && (
                    <p>No active policy documents are currently published. Please contact conference centre staff before submitting a booking.</p>
                )}
                {policies.map((policy) => (
                    <article className="policy-document" key={policy.policyDocumentId || policy.policyType + "-" + policy.version}>
                        <h2>{policy.title}</h2>
                        <p className="policy-version">
                            {policy.policyType} · Version {policy.version}
                            {policy.isSamplePolicy ? " · Sample policy — not yet confirmed as official" : ""}
                        </p>
                        <div className="policy-document-content">{policy.content}</div>
                    </article>
                ))}
                <p className="policy-return"><Link to="/dashboard">Return to your booking</Link></p>
            </section>
        </main>
    );
}
export default PoliciesPage;
