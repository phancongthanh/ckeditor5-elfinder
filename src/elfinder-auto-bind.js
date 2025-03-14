const elfinderConfigs = {
  uploadTargetHash: undefined,
  fullFilePath: false,
  modal: true,
  title: "File Manager",
  useBrowserHistory: false, // Không sử dụng lịch sử trình duyệt
  autoOpen: false, // Không tự động mở
  width: "80%", // Độ rộng của elFinder
  url: "/el-finder/file-system/connector",
  autoOpen: false,
  height: 600,
  commandsOptions: {
    getfile: {
      oncomplete: "close", // Đóng elFinder sau khi chọn file
    },
  },
};

// Hàm merge để kết hợp cấu hình
function mergeConfig(globalConfig, instanceConfig) {
  const result = { ...globalConfig }; // Sao chép cấu hình global

  for (let key in instanceConfig) {
    if (instanceConfig.hasOwnProperty(key)) {
      if (
        typeof instanceConfig[key] === "object" &&
        !Array.isArray(instanceConfig[key]) &&
        instanceConfig[key] !== null
      ) {
        // Nếu là object, đệ quy merge
        result[key] = mergeConfig(globalConfig[key] || {}, instanceConfig[key]);
      } else {
        // Nếu không, ưu tiên giá trị từ instance
        result[key] = instanceConfig[key];
      }
    }
  }

  return result;
}
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

  var configs = mergeConfig(window.elfinderConfigs || {}, {
    commandsOptions: {
      getfile: {
        multiple: multiple, // Cho phép chọn nhiều file
      },
    },
    getFileCallback: function (file, fm) {
      // Cập nhật giá trị của input
      if (multiple) {
        // Nếu cho phép chọn nhiều file
        let existingFiles = input.value ? input.value.split("\n") : [];
        file.forEach((f) => {
          const url = configs.fullFilePath ? fm.convAbsUrl(f.url) : f.path;
          if (!existingFiles.includes(url)) existingFiles.push(url);
        });
        input.value = existingFiles.join("\n");
      } else {
        // Nếu chỉ chọn một file
        input.value = configs.fullFilePath
          ? fm.convAbsUrl(file.url)
          : file.path;
      }

      // Gọi hàm cập nhật hình ảnh
      updateImageList(input.id);
    },
  });

  // Khởi tạo elFinder
  let fm = $(elfinder).dialogelfinder(configs).elfinder("instance");

  return fm;
}

// Hàm cập nhật danh sách hình ảnh
function updateImageList(inputId) {
  var input = document.getElementById(inputId);
  var imageList = document.getElementById(`image-list-${inputId}`);
  if (!input || !imageList) return;
  imageList.innerHTML = ""; // Xóa danh sách hình ảnh hiện tại

  var urls = input.value.split("\n"); // Luôn chuyển input thành mảng URL
  urls.forEach(function (url) {
    if (url) {
      var div = document.createElement("div"); // Tạo một div bao quanh ảnh và các nút
      div.style.backgroundColor = `black`;
      div.style.backgroundImage = `url(${url})`;
      div.style.backgroundSize = "cover";
      div.style.backgroundPosition = "center";
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.display = "inline-flex";
      div.style.justifyContent = "center";
      div.style.alignItems = "center";
      div.style.cursor = "pointer";
      div.style.overflow = "hidden";

      // Để ẩn hiện nút khi hover
      div.style.flexDirection = "column"; // Đặt nút theo cột (vertical)
      div.onmouseover = function () {
        openButton.style.opacity = "1";
        deleteButton.style.opacity = "1";
      };

      div.onmouseleave = function () {
        openButton.style.opacity = "0";
        deleteButton.style.opacity = "0";
      };

      // Tạo nút mở ảnh trong tab mới
      var openButton = document.createElement("button");
      openButton.innerText = "Open";
      openButton.type = "button";
      openButton.style.opacity = "0"; // Ẩn nút khi không hover
      openButton.style.transition = "opacity 0.3s";
      openButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      openButton.style.color = "white";
      openButton.style.border = "none";
      openButton.style.padding = "5px 10px";
      openButton.style.margin = "5px";
      openButton.style.cursor = "pointer";

      openButton.onclick = function () {
        window.open(url, "_blank");
      };

      // Tạo nút xóa ảnh
      var deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      openButton.type = "button";
      deleteButton.style.opacity = "0"; // Ẩn nút khi không hover
      deleteButton.style.transition = "opacity 0.3s";
      deleteButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      deleteButton.style.color = "white";
      deleteButton.style.border = "none";
      deleteButton.style.padding = "5px 10px";
      deleteButton.style.margin = "5px";
      deleteButton.style.cursor = "pointer";

      deleteButton.onclick = function () {
        div.remove(); // Xóa div chứa ảnh và các nút

        // Xóa URL khỏi input
        var updatedUrls = input.value.split("\n").filter(function (item) {
          return item !== url;
        });
        input.value = updatedUrls.join("\n"); // Cập nhật lại giá trị của input
      };

      // Thêm nút vào div
      div.appendChild(openButton);
      div.appendChild(deleteButton);
      imageList.appendChild(div);
    }
  });
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
      // Reload elFinder để cập nhật danh sách file
      fm.exec("reload");
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

window.elfinderConfigs = elfinderConfigs;
window.initElFinder = initElFinder;
window.createUploadElements = createUploadElements;
window.setupElFinders = setupElFinders;
window.autoSetupElFinders = autoSetupElFinders;
