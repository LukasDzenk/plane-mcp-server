import axios from "axios";
export async function makePlaneRequest(method, path, body = null) {
    const hostUrl = process.env.PLANE_API_HOST_URL || "https://api.plane.so/";
    const host = hostUrl.endsWith("/") ? hostUrl : `${hostUrl}/`;
    const url = `${host}api/v1/${path}`;
    const headers = {
        "X-API-Key": process.env.PLANE_API_KEY || "",
    };
    // Only add Content-Type for non-GET requests
    if (method.toUpperCase() !== 'GET') {
        headers["Content-Type"] = "application/json";
    }
    try {
        const config = {
            url,
            method,
            headers,
        };
        // Only include body for non-GET requests
        if (method.toUpperCase() !== 'GET' && body !== null) {
            config.data = body;
        }
        const response = await axios(config);
        return response.data;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`Request failed: ${error.message}`);
        }
        throw error;
    }
}
