import api from "./api";

export const registerUser = async (userData) => {
    const response = await api.post(
        "/Authentication/register",
        userData
    );

    return response.data;
};

export const loginUser = async (loginData) => {
    const response = await api.post(
        "/Authentication/login",
        loginData
    );

    return response.data;
};