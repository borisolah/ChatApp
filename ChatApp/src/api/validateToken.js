export default async function validateToken(token) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_CHAT_SERVER_URL}/validateToken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.ok;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
}
