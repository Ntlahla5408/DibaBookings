import api from "./api";

export async function getPublishedFAQs() {
    const response = await api.get("/FAQs");
    return response.data;
}
