/**
 * Xác thực admin — KHUNG TẠM, chưa nối Firebase Auth thật.
 *
 * KHI CÓ PROJECT B THẬT: thay toàn bộ handler này bằng:
 *   firebase.auth().signInWithEmailAndPassword(email, password)
 *     .then(() => location.href = "dashboard.html")
 *     .catch((err) => showError(err.message));
 * (cần thêm <script src=".../firebase-auth-compat.js"> + khởi tạo app với FIREBASE_CONFIG_B
 * — xem js/firebase-config.js bên repo Swiftstreet chính, dùng chung giá trị Project B).
 */
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  // TODO: thay bằng firebase.auth().signInWithEmailAndPassword() thật.
  sessionStorage.setItem("swiftstreet_admin_mock_session", "1");
  location.href = "dashboard.html";
});
