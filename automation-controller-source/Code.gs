/**
 * Swiftstreet Automation Controller — Apps Script MỚI HOÀN TOÀN, TÁCH RIÊNG khỏi
 * gas-dashboard (Code.gs/Index.html/JavaScript.html hiện có, KHÔNG đụng gì tới file đó, để
 * không xung đột với việc tách File A/File B đang làm riêng).
 *
 * VAI TRÒ: nhận lệnh từ Cloud Function (Firebase Project B) qua HTTP POST, dùng
 * `ScriptApp.getOAuthToken()` để lấy 1 token đại diện ĐÚNG tài khoản Google đang chạy script
 * này (hgntran.contact@gmail.com — tài khoản sở hữu file gốc SwiftCopy.Drive), rồi gọi Drive
 * API + Apps Script API để: copy file mẫu, deploy bản copy thành web app, và (action riêng)
 * chuyển quyền sở hữu cho khách.
 *
 * XEM `docs/setup/08-tao-apps-script-controller.md` ĐỂ BIẾT CÁCH TẠO PROJECT NÀY TỪNG BƯỚC.
 *
 * ĐÃ TEST THẬT (test trên bản copy, không đụng file gốc) — action `copy_and_deploy` chạy
 * đúng đầu-cuối: copy file → tạo version → deploy → nhận URL web app thật, tự động đúng
 * cấu hình "Anyone/USER_DEPLOYING" lấy từ `appsscript.json` mà KHÔNG cần đổi GCP project của
 * file bị copy — lo ngại trước đó (đổi GCP project file gốc) đã được XÁC NHẬN LÀ KHÔNG CẦN.
 * Riêng tài khoản chạy Controller (hgntran.contact@gmail.com) cần bật công tắc "Google Apps
 * Script API" tại https://script.google.com/home/usersettings (khác việc bật API ở GCP
 * Console) — đã làm xong.
 *
 * CHƯA LÀM:
 * - BƯỚC "sửa nội dung code gắn email/SĐT khách" trong `xuLyCopyVaDeploy_()` — ĐỂ TRỐNG có
 *   chủ đích, cần biết chính xác cấu trúc file bàn giao (File A/File B) trước khi viết.
 * - Action `transfer_ownership` — viết xong nhưng CHƯA test thật (cần 1 email thật để nhận
 *   chuyển quyền + tự bấm Chấp nhận).
 */

const SHARED_SECRET_PROP = "CONTROLLER_SHARED_SECRET"; // đặt qua Project Settings → Script Properties, xem hướng dẫn

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const ketQua = xuLyLenh_(body);
  // LƯU Ý: Apps Script Web App LUÔN trả HTTP 200 ở tầng giao thức (không set được mã lỗi
  // 401/500 thật) — mã lỗi nằm TRONG field `error` của JSON. Bên gọi (Cloud Function) phải tự
  // kiểm tra `data.error` thay vì dựa vào response.status.
  return ContentService.createTextOutput(JSON.stringify(ketQua)).setMimeType(ContentService.MimeType.JSON);
}

/** Logic xử lý lệnh THẬT SỰ — tách riêng khỏi doPost() để có thể gọi TRỰC TIẾP từ hàm test
 * chạy ngay trong Apps Script Editor (bấm nút ▶ Run), không cần qua HTTP/curl. */
function xuLyLenh_(body) {
  try {
    const secretDung = PropertiesService.getScriptProperties().getProperty(SHARED_SECRET_PROP);
    if (!secretDung || body.secret !== secretDung) {
      return { error: "Sai mã bí mật (secret)" };
    }
    switch (body.action) {
      case "test_ping":
        return { ok: true, message: "Bộ điều phối hoạt động", chayLuc: new Date().toISOString() };
      case "copy_and_deploy":
        return xuLyCopyVaDeploy_(body);
      case "transfer_ownership":
        return xuLyChuyenQuyenSoHuu_(body);
      default:
        return { error: "Không hiểu action: " + body.action };
    }
  } catch (err) {
    return { error: String(err) };
  }
}

/**
 * ==== HÀM TEST — chạy trực tiếp trong Apps Script Editor, KHÔNG CẦN TERMINAL/CURL ====
 * Cách dùng: chọn đúng tên hàm này trong ô dropdown ở thanh công cụ trên cùng Editor (cạnh nút
 * ▶) → bấm ▶ Run → xem kết quả tại "Execution log" (tự hiện ra bên dưới, hoặc menu Xem/View →
 * Executions nếu không tự hiện).
 */

/** BƯỚC 7a — test nhanh NHẤT: gọi thẳng logic xử lý, KHÔNG qua HTTP — kiểm tra script/mã bí
 * mật đã đặt đúng chưa. */
function chayThuTrongEditor() {
  const secret = PropertiesService.getScriptProperties().getProperty(SHARED_SECRET_PROP);
  Logger.log("Mã bí mật hiện đang lưu trong Script Properties: " + (secret ? "(đã có, dài " + secret.length + " ký tự)" : "CHƯA CÓ — vào Project Settings → Script Properties đặt trước"));

  const ketQua = xuLyLenh_({ secret: secret, action: "test_ping" });
  Logger.log("Kết quả gọi thử action test_ping: " + JSON.stringify(ketQua));
}

/** BƯỚC 7b — test ĐẦY ĐỦ hơn: tự gọi qua HTTP vào ĐÚNG URL web app đã deploy (giống hệt cách
 * Cloud Function sẽ gọi sau này) — TỰ ĐIỀN 2 dòng dưới đây trước khi Run:
 * - URL_WEB_APP: dán URL bạn vừa deploy được (kết thúc bằng /exec).
 * - Chạy xong, mã bí mật đọc tự động từ Script Properties, không cần tự gõ. */
function chayThuGoiURLThat() {
  const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbzniiAPCLv6CouuUva0xrKBqElS2-QKfsMu9nq-WZOZdisOjhQ6ntLkUzVcaLumSjYYnQ/exec";
  const secret = PropertiesService.getScriptProperties().getProperty(SHARED_SECRET_PROP);

  const resp = UrlFetchApp.fetch(URL_WEB_APP, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ secret: secret, action: "test_ping" }),
    followRedirects: true, // QUAN TRỌNG: Apps Script Web App trả về 1 lượt chuyển hướng (redirect)
                           // trước khi tới kết quả thật — đây là lý do curl từ Terminal hay bị
                           // "trang lỗi HTML" nếu không tự thêm cờ theo dõi redirect (-L).
    muteHttpExceptions: true,
  });

  Logger.log("Mã trạng thái HTTP: " + resp.getResponseCode());
  Logger.log("Nội dung trả về: " + resp.getContentText());
}

/**
 * BƯỚC 8 — test action "copy_and_deploy" trên 1 bản COPY TEST (KHÔNG PHẢI file gốc thật).
 * TỰ ĐIỀN 2 dòng dưới đây trước khi Run:
 * - FILE_ID_TEST: ID bản copy TEST bạn tự tạo bằng "Tạo bản sao" (lấy trong URL Drive, đoạn
 *   giữa "/d/" và "/edit").
 * - THU_MUC_DICH_ID: ID 1 thư mục Drive bất kỳ (tạo mới 1 thư mục rỗng cũng được) để chứa bản
 *   copy MỚI mà Controller sẽ tạo ra trong lần test này.
 */
function chayThuCopyVaDeploy() {
  const FILE_ID_TEST = "15Tqn39sVC2GH0xHfhI_TjduZY8n9cc0xHw1j0N93aJKXSVxhDfMG-bs7"; // ⚠️ XÁC NHẬN LẠI: đây phải là bản COPY TEST, KHÔNG PHẢI file gốc thật
  const THU_MUC_DICH_ID = "1xLTywxU6lEWofNLhg9EmPQ83b11WUNOY";

  const secret = PropertiesService.getScriptProperties().getProperty(SHARED_SECRET_PROP);
  const ketQua = xuLyLenh_({
    secret: secret,
    action: "copy_and_deploy",
    fileIdMau: FILE_ID_TEST,
    thuMucDichId: THU_MUC_DICH_ID,
    tenBanSao: "TEST - Bộ điều phối tự tạo",
    email: "test-khong-co-that@vidu.com",
  });
  Logger.log("Kết quả copy_and_deploy: " + JSON.stringify(ketQua));
}

/** Gọi Drive API v3 bằng OAuth token của chính tài khoản đang chạy script này. */
function driveFetch_(method, path, query, body) {
  const token = ScriptApp.getOAuthToken();
  let url = "https://www.googleapis.com/drive/v3" + path;
  if (query) {
    url += "?" + Object.keys(query).map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(query[k])).join("&");
  }
  const options = { method, headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true };
  if (body) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(body);
  }
  const resp = UrlFetchApp.fetch(url, options);
  const code = resp.getResponseCode();
  const data = JSON.parse(resp.getContentText() || "{}");
  if (code >= 400) throw new Error("Drive API lỗi " + code + ": " + JSON.stringify(data));
  return data;
}

/** Gọi Apps Script API v1 — CẦN GCP project của CHÍNH SCRIPT NÀY đã bật Apps Script API. */
function appsScriptFetch_(method, path, body) {
  const token = ScriptApp.getOAuthToken();
  const url = "https://script.googleapis.com/v1" + path;
  const options = { method, headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true };
  if (body) {
    options.contentType = "application/json";
    options.payload = JSON.stringify(body);
  }
  const resp = UrlFetchApp.fetch(url, options);
  const code = resp.getResponseCode();
  const data = JSON.parse(resp.getContentText() || "{}");
  if (code >= 400) throw new Error("Apps Script API lỗi " + code + ": " + JSON.stringify(data));
  return data;
}

/**
 * POST { fileIdMau, tenBanSao, thuMucDichId, email } -> { fileId, versionNumber, deployment }
 *
 * fileIdMau: ID file/project Apps Script MẪU cần copy (lúc test: dán ID bản copy TEST bạn tự
 * tạo bằng "Tạo bản sao" — KHÔNG dùng file gốc thật cho tới khi test xong).
 * thuMucDichId: ID thư mục Drive nơi đặt bản copy mới.
 */
function xuLyCopyVaDeploy_(body) {
  const { fileIdMau, tenBanSao, thuMucDichId, email } = body;
  if (!fileIdMau || !thuMucDichId) throw new Error("Thiếu fileIdMau hoặc thuMucDichId");

  // BƯỚC 1 — Copy file mẫu.
  const fileMoi = driveFetch_("POST", "/files/" + fileIdMau + "/copy", { fields: "id,name" }, {
    name: tenBanSao || ("Bản sao " + email + " - " + new Date().toISOString()),
    parents: [thuMucDichId],
  });

  // BƯỚC 2 — TODO: SỬA NỘI DUNG CODE gắn email/SĐT khách vào các vị trí đã định trước (theo
  // roadmap: rải rác nhiều file chống dùng lậu). ĐANG ĐỂ TRỐNG — cần biết chính xác cấu trúc
  // file bàn giao (File A/File B) trước khi viết đúng, tránh đoán mò làm hỏng file khách nhận.
  // Khung code sẽ dùng (tham khảo, CHƯA bật):
  //   const noiDung = appsScriptFetch_("GET", "/projects/" + fileMoi.id + "/content");
  //   noiDung.files.forEach(function (f) {
  //     f.source = f.source.split("__EMAIL_PLACEHOLDER__").join(email);
  //   });
  //   appsScriptFetch_("PUT", "/projects/" + fileMoi.id + "/content", noiDung);

  // BƯỚC 3 — Tạo version rồi deploy (Apps Script API yêu cầu có version trước khi deploy được).
  // ĐÃ TEST THẬT THÀNH CÔNG — deployment tự nhận cấu hình "Anyone/USER_DEPLOYING" từ
  // appsscript.json, không cần khai báo entryPoints thủ công trong payload này.
  const version = appsScriptFetch_("POST", "/projects/" + fileMoi.id + "/versions", {
    description: "Tự động tạo bởi Swiftstreet Automation Controller",
  });
  const deployment = appsScriptFetch_("POST", "/projects/" + fileMoi.id + "/deployments", {
    versionNumber: version.versionNumber,
    manifestFileName: "appsscript",
    description: "Deploy tự động cho khách",
  });

  return { fileId: fileMoi.id, versionNumber: version.versionNumber, deployment: deployment };
}

/**
 * POST { fileId, emailKhach } -> { permission }
 * Chuyển quyền sở hữu file cho khách — TÁCH RIÊNG khỏi bước copy+deploy, chỉ gọi SAU KHI đã
 * xác nhận bản copy deploy thành công, tránh chuyển quyền 1 file bị lỗi giữa chừng.
 * LƯU Ý: khách BẮT BUỘC phải tự bấm "Chấp nhận" trong email nhận được — đây là giới hạn của
 * Google (đổi chủ sở hữu khác domain luôn cần bên nhận xác nhận), KHÔNG tự động hoá được.
 */
function xuLyChuyenQuyenSoHuu_(body) {
  const { fileId, emailKhach } = body;
  if (!fileId || !emailKhach) throw new Error("Thiếu fileId hoặc emailKhach");

  const permission = driveFetch_("POST", "/files/" + fileId + "/permissions", { transferOwnership: true, sendNotificationEmail: true }, {
    role: "owner",
    type: "user",
    emailAddress: emailKhach,
  });
  return { permission: permission };
}
