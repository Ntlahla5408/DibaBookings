import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";

function PaymentReturnPage() {
    const location = useLocation();
    const cancelled = location.pathname === "/payment/cancel";
    const bookingId = new URLSearchParams(location.search).get("bookingId");
    const [paymentStatus, setPaymentStatus] = useState("Checking");
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let active = true;

        async function checkPayment() {
            if (cancelled) {
                setPaymentStatus("Cancelled");
                setChecking(false);
                return;
            }

            if (!bookingId) {
                setPaymentStatus("Failed");
                setChecking(false);
                return;
            }

            try {
                // Presentation demo: opening this page marks the payment as Paid in the database.
                await api.post("/Payments/demo-confirm-success/" + encodeURIComponent(bookingId));
                if (active) setPaymentStatus("Successful");
            } catch {
                if (active) setPaymentStatus("Failed");
            } finally {
                if (active) setChecking(false);
            }
        }

        checkPayment();
        return () => {
            active = false;
        };
    }, [bookingId, cancelled]);

    const successful = paymentStatus === "Successful";
    const updateFailed = paymentStatus === "Failed";

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <section className="card shadow-sm">
                        <div className="card-body p-4 p-md-5 text-center">
                            {successful && (
                                <div className="mb-3" aria-hidden="true">
                                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success" style={{ width: 64, height: 64, fontSize: 36 }}>✓</span>
                                </div>
                            )}
                            <h1 className="h3 mb-3">
                                {cancelled
                                    ? "Payment cancelled"
                                    : successful
                                        ? "Payment Successful"
                                        : checking
                                            ? "Updating payment"
                                            : "Payment update failed"}
                            </h1>
                            <p className="mb-4">
                                {cancelled
                                    ? "Your payment was cancelled."
                                    : successful
                                        ? "Your payment has been confirmed."
                                        : pendingVerification || checking
                                            ? "Updating payment status."
                                            : "The payment status could not be updated. Please return to your booking and try again."}
                            </p>
                            {bookingId ? (
                                <Link
                                    className="btn btn-primary"
                                    to={`/dashboard?view=booking-detail&bookingId=${encodeURIComponent(bookingId)}`}
                                >
                                    Return to Booking
                                </Link>
                            ) : (
                                <Link className="btn btn-primary" to="/dashboard?view=bookings">
                                    Return to Bookings
                                </Link>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default PaymentReturnPage;
