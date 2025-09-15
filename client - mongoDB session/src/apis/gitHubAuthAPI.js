export const continueWithGitHub = () => {
    // window.location.href = "http://localhost:5000/auth/github";
    window.open(
        `http://localhost:4000/auth/github`,
        "auth-popup",
        "width=500,height=600"
    );
}