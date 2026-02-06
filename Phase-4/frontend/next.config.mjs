/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://todo-chatbot-api-basit-2025.onrender.com","http://127.0.0.1:46473","http://localhost:46473","http://localhost:8000"
  },
};

export default nextConfig;

