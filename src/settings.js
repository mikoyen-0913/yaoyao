// settings.js

// 判斷是否為本地開發環境
const isLocalhost = window.location.hostname === "localhost";

// 根據環境自動切換 API base URL
export const apiBaseUrl = isLocalhost
  ? "http://127.0.0.1:5000"
  : "https://yaoyaoproject-88907.web.app"; // 你部署的網址（或 ngrok URL）
