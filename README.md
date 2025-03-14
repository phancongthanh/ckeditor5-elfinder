# CKEditor and elFinder Integration Example

This project demonstrates the integration of CKEditor 5 with elFinder, allowing users to upload and manage images directly within the CKEditor editor.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Libraries Used](#libraries-used)
- [Usage Example](#usage-example)
- [License](#license)

## Overview

This integration utilizes CKEditor 5 as a rich text editor and elFinder as a file manager for uploading images. This example showcases how to set up both libraries to work seamlessly together.
The project is referenced and developed from [Integration-with-CKEditor-5](https://github.com/Studio-42/elFinder/wiki/Integration-with-CKEditor-5)

## Getting Started

To use this project, download the files from the `dist` directory and link them in your HTML file as shown in the provided example. Ensure that you also include the necessary CDN links for jQuery, jQuery UI, Bootstrap, elFinder, and CKEditor 5.

1. Download the files from the `dist` directory.
2. Include them in your HTML as follows:

```html
<!-- elFinder -->
<script src="https://cdn.jsdelivr.net/npm/ckeditor5-elfinder@1.1.1/dist/elfinder-auto-bind.min.js"></script>
<!-- CKEditor -->
<script
  src="https://cdn.jsdelivr.net/npm/ckeditor5-elfinder@1.1.1/dist/ckeditor-configs.min.js"
  type="module"
></script>
<script src="https://cdn.jsdelivr.net/npm/ckeditor5-elfinder@1.1.1/dist/ckeditor-elfinder-integration.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/ckeditor5-elfinder@1.1.1/dist/ckeditor-auto-bind.min.js"></script>
```

## Libraries Used

The following libraries are included in this project:

1. **jQuery**: A fast, small, and feature-rich JavaScript library.

   - CDN: `https://cdn.jsdelivr.net/npm/jquery@1.12.4/dist/jquery.min.js`

2. **jQuery UI**: A curated set of user interface interactions, effects, widgets, and themes built on top of jQuery.

   - CDN:
     - CSS: `https://code.jquery.com/ui/1.9.2/themes/base/jquery-ui.css`
     - JS: `https://code.jquery.com/ui/1.9.2/jquery-ui.min.js`

3. **Bootstrap**: The most popular HTML, CSS, and JS library for responsive design.

   - CDN:
     - CSS: `https://maxcdn.bootstrapcdn.com/bootstrap/2.3.2/css/bootstrap.min.css`
     - JS: `https://maxcdn.bootstrapcdn.com/bootstrap/2.3.2/js/bootstrap.min.js`

4. **elFinder**: An open-source file manager for web applications.

   - CDN:
     - CSS: `https://cdnjs.cloudflare.com/ajax/libs/elfinder/2.1.65/css/elfinder.full.min.css`
     - JS: `https://cdnjs.cloudflare.com/ajax/libs/elfinder/2.1.65/js/elfinder.full.min.js`

5. **CKEditor 5**: A powerful rich text editor with a modern interface.
   - CDN:
     - CSS: `https://cdn.ckeditor.com/ckeditor5/43.0.0/ckeditor5.css`
     - JS: included in ckeditor-configs.min.js

### Local Libraries

- **elfinder-auto-bind.min.js**: Custom script for initializing elFinder.
- **ckeditor-configs.min.js**: Custom configurations for CKEditor.
- **ckeditor-elfinder-integration.min.js**: Script for integrating CKEditor with elFinder.
- **ckeditor-auto-bind.min.js**: Script for automatically binding CKEditor.

## Usage Example

In the `example.html` file, the following elements are set up for CKEditor and elFinder:

- **Image Upload Input**:

  ```html
  <input id="image" class="upload" />
  <textarea id="images" class="upload"></textarea>
  ```

- **Text Areas**:
  ```html
  <textarea id="ckeditor" class="ckeditor"></textarea>
  ```

### Initialization

The following JavaScript initializes both CKEditor and elFinder:

```javascript
document.addEventListener("DOMContentLoaded", handleCKEditorChanges);
document.addEventListener("DOMContentLoaded", setupElFinders);
```

If you prefer not to automatically initialize the editors and file manager, you can manually set them up using the following commented code:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  initElFinder(document.getElementById("image")).getUI().dialogelfinder("open");
  initElFinder(document.getElementById("images"))
    .getUI()
    .dialogelfinder("open");

  initializeEditor(document.getElementById("ckeditor"));
});
```

You need to ensure that the `window.elfinderConfigs.url` points to your elFinder backend for handling file uploads.

## License

This project is licensed under the [MIT License](LICENSE). Please refer to the LICENSE file for more details.
