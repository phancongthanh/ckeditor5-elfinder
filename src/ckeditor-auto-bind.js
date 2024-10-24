window.editors = window.editors || {}; // Khởi tạo nếu chưa có

function initializeEditor(textarea) {
  // Lấy ckeditor5 từ file ckeditor-configs.js
  let ClassicEditor = window.ClassicEditor;
  let editorConfig = window.editorConfig;

  if (!textarea.id) {
    textarea.id = "ckeditor_" + Math.random(); // Tạo id duy nhất
  }

  // Chỉ khởi tạo CKEditor nếu chưa có instance nào cho textarea này
  if (textarea.style.display !== "none" && !window.editors[textarea.id]) {
    ClassicEditor.create(textarea, editorConfig)
      .then((editor) => {
        window.editors[textarea.id] = editor; // Lưu instance CKEditor vào window.editors

        // Tự động tích hợp elFinder nếu có sẵn
        if (typeof integrateWithElFinder !== "undefined") {
          integrateWithElFinder(editor);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
function destroyEditor(textarea) {
  if (textarea.id && window.editors[textarea.id]) {
    window.editors[textarea.id].destroy(); // Hủy instance CKEditor
    delete window.editors[textarea.id]; // Xóa instance khỏi window.editors
  }
}
function handleCKEditorChanges() {
  // Khởi tạo CKEditor cho các textarea mới
  document.querySelectorAll("textarea.ckeditor").forEach(initializeEditor);

  // Hủy CKEditor cho các textarea đã bị xóa
  for (var instanceId in window.editors) {
    if (window.editors.hasOwnProperty(instanceId)) {
      const textarea = document.getElementById(instanceId);
      if (!textarea) {
        destroyEditor({ id: instanceId }); // Hủy editor nếu textarea không còn trong DOM
      }
    }
  }
}

// Sử dụng MutationObserver để theo dõi thay đổi DOM
function autoHandleCKEditorChanges() {
  const observer = new MutationObserver(handleCKEditorChanges);
  observer.observe(document.body, { childList: true, subtree: true });
}

window.initializeEditor = initializeEditor;
window.destroyEditor = destroyEditor;
window.handleCKEditorChanges = handleCKEditorChanges;
window.autoHandleCKEditorChanges = autoHandleCKEditorChanges;
