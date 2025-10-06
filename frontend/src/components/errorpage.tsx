import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorPage: React.FC<{ message?: string }> = ({
  message = "Something went wrong. Please try again.",
}) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        backgroundColor: "#f8d7da",
        color: "#721c24",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Oops! Error Occurred
      </h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>{message}</p>
      <button
        onClick={() => navigate("/ws-ts")}
        style={{
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          backgroundColor: "#721c24",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Go to Chat
      </button>
    </div>
  );
};

export default ErrorPage;
