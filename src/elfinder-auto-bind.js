// Hàm khởi tạo elFinder
function initElFinder(input) {
  if (!input.id) input.id = "elfinder_" + Math.random(); // Tạo id duy nhất

  let multiple = input.tagName.toLowerCase() == "textarea";
  // Tạo thẻ div#elfinder-inputId nếu chưa tồn tại
  let elfinder = document.getElementById("elfinder-" + input.id);
  if (!elfinder) {
    elfinder = document.createElement("div");
    elfinder.id = "elfinder-" + input.id;
    document.body.appendChild(elfinder);
  }
  elfinder.style.display = "block";

  // Khởi tạo elFinder
  let fm = $(elfinder)
    .dialogelfinder({
      modal: true,
      title: "File Manager",
      url: window.connectorUrl || "/el-finder/file-system/connector",
      autoOpen: false,
      height: 600,
      commandsOptions: {
        getfile: {
          oncomplete: "close", // Đóng elFinder sau khi chọn file
          multiple: multiple, // Cho phép chọn nhiều file
        },
      },
      getFileCallback: function (file, fm) {
        // Cập nhật giá trị của input
        if (multiple) {
          // Nếu trường input cho phép chọn nhiều file
          var existingFiles = input.value ? input.value.split("\n") : [];
          file.forEach((f) => {
            let url = fm.convAbsUrl(f.url);
            if (!existingFiles.includes(url)) existingFiles.push(url);
          });
          input.value = existingFiles.join("\n");
        } else {
          // Nếu chỉ chọn một file
          let url = fm.convAbsUrl(file.url);
          input.value = url;
        }

        // Gọi hàm cập nhật hình ảnh
        updateImageList(input.id);
      },
    })
    .elfinder("instance");

  return fm;
}

// Hàm cập nhật danh sách hình ảnh
function updateImageList(inputId) {
  var input = document.getElementById(inputId);
  var imageList = document.getElementById(`image-list-${inputId}`);
  if (!input || !imageList) return;
  imageList.innerHTML = ""; // Xóa danh sách hình ảnh hiện tại

  if (input.tagName.toLowerCase() == "textarea") {
    var urls = input.value.split("\n");
    urls.forEach(function (url) {
      var img = document.createElement("img");
      img.src = url;
      img.style.width = "100px";
      imageList.appendChild(img);
    });
  } else {
    var url = input.value;
    if (url) {
      var img = document.createElement("img");
      img.src = url;
      img.style.width = "100px";
      imageList.appendChild(img);
    }
  }
}

// Hàm tạo nút upload và div hiển thị hình ảnh
function createUploadElements(input) {
  if (!input.id) input.id = "elfinder_" + Math.random(); // Tạo id duy nhất

  var inputId = input.id;

  if (!document.querySelector(`button[for="${inputId}"]`)) {
    // Tạo nút upload
    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("for", inputId);
    button.className = "button-upload md-btn md-btn-new md-btn-wave-light";
    button.textContent = "Upload";
    input.parentNode.insertBefore(button, input.nextSibling);

    // Tạo div để chứa danh sách hình ảnh
    var imageListDiv = document.createElement("div");
    imageListDiv.className = "image-list";
    imageListDiv.id = `image-list-${inputId}`;
    input.parentNode.insertBefore(imageListDiv, button.nextSibling);

    // Tạo elfinder
    let fm = initElFinder(input);

    // Gán sự kiện click cho nút upload
    button.addEventListener("click", function () {
      // Mở elFinder dialog
      let fmNode = fm.getUI();
      fmNode.dialogelfinder("open");
      fmNode.trigger("unselectall");
    });

    // Gán sự kiện thay đổi cho input để cập nhật danh sách hình ảnh
    updateImageList(inputId);
    input.addEventListener("input", function () {
      updateImageList(inputId);
    });
  }
}

// Hàm cấu hình cho các trường input có lớp upload
function setupElFinders() {
  document.querySelectorAll("input.upload").forEach(createUploadElements);
  document.querySelectorAll("textarea.upload").forEach(createUploadElements);
}

// Sử dụng MutationObserver để theo dõi thay đổi DOM
function autoSetupElFinders() {
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length > 0) {
        setupElFinders();
      }
    });
  });

  // Theo dõi thay đổi trong body
  observer.observe(document.body, { childList: true, subtree: true });
}

window.initElFinder = initElFinder;
window.createUploadElements = createUploadElements;
window.setupElFinders = setupElFinders;
window.autoSetupElFinders = autoSetupElFinders;
