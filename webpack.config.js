const path = require("path");
const glob = require("glob");

// Sử dụng glob để tìm tất cả các file .js trong thư mục src
const entryFiles = glob.sync("./src/**/*.js");

module.exports = {
  // Đặt tất cả các file tìm được làm entry points
  entry: entryFiles.reduce((entries, file) => {
    const name = path.basename(file, path.extname(file)); // Lấy tên file mà không có phần mở rộng
    entries[name] = `./${file}`; // Thêm file vào danh sách entry
    return entries;
  }, {}),

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].min.js", // Xuất ra file với tên giống tên file gốc
  },

  mode: "production", // Webpack sẽ tự động minify trong chế độ production
};
