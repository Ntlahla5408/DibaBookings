import api from "./api";

export async function getMyProfile() {
    return api.get("/Users/me");
}

export async function updateMyProfile(profile) {
    return api.put("/Users/me", profile);
}
