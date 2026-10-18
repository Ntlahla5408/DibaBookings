import api from "./api";

export async function getPublishedFAQs() {
    const response = await api.get("/FAQs");
    return response.data;
}

export async function getAllFAQs() {
    return api.get("/FAQs/manage");
}

export async function createFAQ(faq) {
    return api.post("/FAQs", faq);
}

export async function updateFAQ(faqId, faq) {
    return api.put(`/FAQs/${faqId}`, faq);
}

export async function hideFAQ(faqId) {
    return api.delete(`/FAQs/${faqId}`);
}
