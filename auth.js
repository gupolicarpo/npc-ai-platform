// auth.js
// This file checks if a user is logged in and provides auth helper functions.

// IMPORTANT: Supabase URL and public anon Key
const SUPABASE_URL = "https://vmvxkyfzpyeqvxlruzvv.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdnhreWZ6cHllcXZ4bHJ1enZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTA4MDQsImV4cCI6MjA2OTg4NjgwNH0.Fv10M-Hx4XEfUTiplE-vD8-8yQlYcdH8a_bj4LTDPas";

// === THIS IS THE MOST IMPORTANT CHANGE ===
// This line tells all your frontend pages where your backend server is.
const API_BASE_URL =
    "https://876e9618-ad6b-4fa6-82ba-7fd5566c88e4-00-l978jvz7myaz.janeway.replit.dev";

// NOTE: The line below uses the global 'supabase' variable from the CDN script loaded in the HTML files.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// This function gets the current user's session, which includes the vital access_token.
async function getUserSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
        console.error("Error getting session:", error);
        return null;
    }
    return data.session;
}

// This gatekeeper function protects pages that require a login.
async function protectPage() {
    const session = await getUserSession();

    // List of public pages that don't require a login
    const publicPages = [
        "/index.html",
        "/login.html",
        "/signup.html",
        "/discover.html",
    ];
    const currentPagePath = window.location.pathname;

    if (!session) {
        // If no user is logged in, and we are NOT on a public page, redirect to login.
        if (!publicPages.some((page) => currentPagePath.endsWith(page))) {
            console.log("No user logged in, redirecting to login.");
            window.location.href = "/login.html";
        }
    } else {
        // If user IS logged in and tries to go to the main landing, login, or signup page,
        // redirect them to their campaigns dashboard.
        if (publicPages.some((page) => currentPagePath.endsWith(page))) {
            console.log("User is already logged in, redirecting to dashboard.");
            window.location.href = "/campaigns.html";
        }
    }
}

// === THIS FUNCTION IS NOW CORRECTED TO USE THE API_BASE_URL ===
async function secureFetch(endpoint, options = {}) {
    // Parameter is now 'endpoint' for clarity
    // This line combines the base URL with the specific API path.
    const url = `${API_BASE_URL}${endpoint}`;

    const session = await getUserSession();

    if (!session) {
        console.error(
            "No user session found. Cannot make secure call. Redirecting to login.",
        );
        window.location.href = "/login.html";
        throw new Error("User not authenticated.");
    }

    const token = session.access_token;

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    } else {
        delete headers["Content-Type"];
    }

    const newOptions = {
        ...options,
        headers: headers,
    };

    return fetch(url, newOptions);
}

// Run the check as soon as the script loads
protectPage();

// This call now correctly points to your backend
secureFetch("/api/init-usage", { method: "POST" }).catch((err) =>
    console.error("Usage init failed", err),
);
