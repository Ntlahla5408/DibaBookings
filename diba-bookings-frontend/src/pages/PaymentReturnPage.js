import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getBookings } from "../services/bookingService";
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

            if (!bookingId || !localStorage.getItem("token")) {
                setPaymentStatus("Verification required");
                setChecking(false);
                return;
            }

            try {
                // This endpoint only records a simulated payment when the API
                // is running in Development with DemoPayments explicitly enabled.
                // Production must use verified Yoco payment confirmation instead.
                await api.post(
                    `/Payments/demo-confirm-success/${encodeURIComponent(bookingId)}`
                );

                const response = await getBookings();
                const booking = (response.data || []).find(
                    (item) => String(item.bookingId).toLowerCase() === bookingId.toLowerCase()
                );
                const status = String(booking?.paymentStatus || "").trim().toLowerCase();

                if (!active) return;

                if (["paid", "successful", "completed"].includes(status)) {
                    setPaymentStatus("Successful");
                } else if (booking) {
                    setPaymentStatus("Verifying");
                } else {
                    setPaymentStatus("Verification required");
                }
            } catch {
                if (active) setPaymentStatus("Verifying");
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
    const pendingVerification = paymentStatus === "Verifying" || paymentStatus === "Checking";

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
                                        : pendingVerification || checking
                                            ? "Verifying payment"
                                            : "Payment status unavailable"}
                            </h1>
                            <p className="mb-4">
                                {cancelled
                                    ? "Your payment was cancelled."
                                    : successful
                                        ? "Your payment has been confirmed."
                                        : pendingVerification || checking
                                            ? "Yoco has returned you to DIBA Bookings. Your payment status is still being confirmed. Please check your booking before trying to pay again."
                                            : "Sign in and open your booking to check its latest payment status."}
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
