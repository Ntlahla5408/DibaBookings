import { Link, useLocation } from "react-router-dom";

function PaymentReturnPage() {
    const location = useLocation();
    const cancelled = location.pathname === "/payment/cancel";

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <section className="card shadow-sm">
                        <div className="card-body p-4 p-md-5">
                            <h1 className="h3 mb-3">
                                {cancelled ? "Payment cancelled" : "Payment return received"}
                            </h1>
                            <p className="mb-4">
                                {cancelled
                                    ? "Your payment was cancelled. You can return to DIBA Bookings and try again when you are ready."
                                    : "You have returned to DIBA Bookings. Your payment must still be verified by the system before it can be marked as paid. Check your booking status before trying to pay again."}
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                                <Link className="btn btn-primary" to="/dashboard">Go to dashboard</Link>
                                <Link className="btn btn-outline-secondary" to="/login">Sign in</Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default PaymentReturnPage;
