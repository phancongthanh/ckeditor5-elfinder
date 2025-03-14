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

// Tích hợp CKEditor với elFinder
function integrateWithElFinder(editor) {
  // Lấy các plugin và lệnh cần thiết từ CKEditor
  const ckf = editor.commands.get("ckfinder"); // Lệnh ckfinder
  const fileRepo = editor.plugins.get("FileRepository"); // Repository để quản lý file
  const ntf = editor.plugins.get("Notification"); // Thông báo
  const i18 = editor.locale.t; // Hàm dịch ngôn ngữ

  // Hàm chèn hình ảnh vào CKEditor
  const insertImages = (urls) => {
    const imgCmd = editor.commands.get("imageUpload"); // Lệnh upload hình ảnh
    if (!imgCmd.isEnabled) {
      ntf.showWarning(i18("Could not insert image at the current position."), {
        title: i18("Inserting image failed"),
        namespace: "ckfinder",
      });
      return;
    }
    editor.execute("imageInsert", { source: urls });
  };

  let _fm;

  // Hàm để lấy instance của elFinder
  const getfm = (open) => {
    return new Promise((resolve, reject) => {
      // Khởi tạo elFinder nếu chưa có
      if (!_fm) {
        let container = document.createElement("div"); // Tạo phần tử div để chứa elFinder
        document.body.appendChild(container); // Thêm phần tử div vào body

        let configs = mergeConfig(window.elfinderConfigs || {}, {
          startPathHash: open || void 0, // Thư mục bắt đầu
          commandsOptions: {
            getfile: {
              multiple: true, // Cho phép chọn nhiều file
            },
          },
          getFileCallback: (files, fm) => {
            let imgs = [];
            fm.getUI("cwd").trigger("unselectall"); // Bỏ chọn tất cả các file
            files.forEach((f) => {
              let url = configs.fullFilePath
                ? fm.convAbsUrl(f.url)
                : new URL(f.url).pathname;
              if (f && f.mime.match(/^image\//i)) {
                imgs.push(url); // Thêm URL hình ảnh vào danh sách
              } else {
                editor.execute("link", url); // Thêm link cho các file không phải hình ảnh
              }
            });
            if (imgs.length) {
              insertImages(imgs); // Chèn hình ảnh vào CKEditor
            }
          },
        });

        _fm = $(container).dialogelfinder(configs).elfinder("instance");
      }
      if (!open) resolve(_fm);
      else {
        if (!Object.keys(_fm.files()).length) {
          _fm.one("open", () => {
            _fm.file(open) ? resolve(_fm) : reject(_fm, "errFolderNotFound");
          });
        } else {
          new Promise((res, rej) => {
            if (_fm.file(open)) {
              res();
            } else {
              _fm
                .request({ cmd: "parents", target: open })
                .done((e) => {
                  _fm.file(open) ? res() : rej();
                })
                .fail(() => {
                  rej();
                });
            }
          })
            .then(() => {
              _fm
                .exec("open", open)
                .done(() => {
                  resolve(_fm);
                })
                .fail((err) => {
                  reject(_fm, err ? err : "errFolderNotFound");
                });
            })
            .catch((err) => {
              reject(_fm, err ? err : "errFolderNotFound");
            });
        }
      }
    });
  };

  // Tùy chỉnh lệnh ckfinder để mở elFinder
  if (ckf) {
    ckf.execute = () => {
      getfm().then((fm) => {
        fm.exec("reload"); // Reload elFinder để cập nhật danh sách file
        fm.getUI().dialogelfinder("open"); // Mở elFinder
      });
    };
  }

  // Đóng elfinder khi hủy editor
  editor.on("destroy", () => {
    if (_fm) {
      _fm.getUI().dialogelfinder("close"); // Đóng modal elFinder khi editor bị hủy
    }
  });

  // Tạo uploader adapter cho CKEditor
  const uploader = function (loader) {
    const upload = async function (file) {
      try {
        const fm = await getfm(window.elfinderConfigs.uploadTargetHash);
        const fmNode = fm.getUI();
        fmNode.dialogelfinder("open"); // Mở elFinder để chọn file
        // Đợi elFinder mở hoàn toàn
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const target = window.elfinderConfigs.uploadTargetHash || fm.cwd().hash;
        const data = await fm.exec(
          "upload",
          { files: [file], target },
          void 0,
          target
        );
        if (data.added && data.added.length) {
          try {
            const url = await fm.url(data.added[0].hash, { async: true });
            fmNode.dialogelfinder("close"); // Đóng elFinder sau khi upload xong
            return {
              default: window.elfinderConfigs.fullFilePath
                ? fm.convAbsUrl(url)
                : new URL(url).pathname, // Trả về URL của file vừa upload
            };
          } catch (error) {
            fmNode.dialogelfinder("close");
            throw new Error("errFileNotFound");
          }
        } else {
          fmNode.dialogelfinder("close");
          throw new Error(fm.i18n(data.error ? data.error : "errUpload"));
        }
      } catch (err) {
        console.log(err);
        throw new Error("errUploadNoFiles");
      }
    };
    this.upload = async function () {
      let file = loader.file;
      if (
        file instanceof Promise ||
        (file && typeof file.then === "function")
      ) {
        file = await file;
      }
      return await upload(file); // Thực hiện upload
    };
    this.abort = function () {
      _fm && _fm.getUI().trigger("uploadabort"); // Hủy upload nếu cần
    };
  };

  // Tạo uploader adapter cho CKEditor
  fileRepo.createUploadAdapter = (loader) => new uploader(loader);
}

window.integrateWithElFinder = integrateWithElFinder;
