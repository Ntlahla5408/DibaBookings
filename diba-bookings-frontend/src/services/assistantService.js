import api from "./api";

export async function askDibaAssistant(question) {
    const response = await api.post("/DibaAssistant/ask", {
        question
    });

    return response.data;
}
