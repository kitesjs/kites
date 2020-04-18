# Overview

**Kites** là một dự án mã nguồn mở với mục tiêu là tạo ra các ứng dụng Web dựa trên các bản mẫu một cách nhanh chóng và dễ dàng.

Bạn có thể khởi tạo nhanh chóng một ứng dụng kites bằng lệnh sau đây:

```bash
kites init my-project --template restful
```

Kết thúc lệnh trên là bạn đã tạo ra một dự án RESTful API, rất đơn giản phải không?

* [Xem chi tiết hướng dẫn](/documentation/guide/) tạo một project với kites [tại đây](/documentation/guide/).

Sơ lược qua về kỹ thuật thì **kites** tự động phát hiện các **extensions** đã được install trong thư mục `node_modules`, do đó, khi khởi chạy các phần mở rộng này được nạp tự động, một chương trình đơn giản nhất trông như thế này:

* Tham số `discover: true` nghĩa là nhắc **kites** tự động nạp tất cả các **extensions** phát hiện được trong thư mục *node_modules*.

```js
'use strict'
const engine = require('@kites/engine');

/**
 * minimalist kites application
 */
engine({
        loadConfig: true,
        discover: true
    })
    .init()
    .then((kites) => {
        kites.logger.info('Hello world!');
    })
    .catch((e) => {
        console.error(e.stack);
        process.exit(1);
    })
```

## Mục tiêu của dự án Kites

* Là 1 framework tạo ra các ứng dụng web đầy tham vọng
* Là 1 công cụ dòng lệnh, hỗ trợ khởi tạo nhanh dự án
* Kết nối với tất cả các loại cơ sở dữ liệu: `MongoDB`, `Cassandra`, `MySQL`, `Postgres`, `Redis`, ...
* Mô-đun hóa các thành phần, tiện ích tái sử dụng thành các phần mở rộng (extensions)
* Phân tách tầng ứng dụng: device access layer, database access layer, cron jobs, ...
* Đóng gói các dự án cơ sở thành khuôn mẫu (templates)
* Mỗi một khuôn mẫu đều có `Dockerfile` và `docker-compose`
* Tích hợp với các dự án, module khác mà không gây ra xung đột


## Server side

Với mục tiêu là dễ dàng tạo ra một máy chủ phục vụ một ứng dụng Web, ta có thể khởi chạy ngay mà không phải cấu hình thêm bất cứ gì bằng một trong hai cách sau:

(1) hoặc:

```bash
# tại thư mục của dự án
kites up
```

(2) hoặc:

```bash
# tại thư mục của dự án
docker-compose build
docker-compose up
```

## Templates implementation

Sau đây là checklist các khuôn mẫu sẽ được lên kế hoạch thực hiện và cập nhật liên tục, vui lòng theo dõi:

* [x] `mvc`: Assembling all into complete ship (default), [nodevn/kites-template-mvc](https://github.com/vunb/kites-template-mvc)
* [x] **`basic`**: Template for building an application from scratch
* [x] **`apidoc`**: Template for API Documentation, [nodevn/kites-template-apidoc](https://github.com/nodevn/kites-template-apidoc)
* [x] `express`: Template for Express Application, [nodevn/kites-template-express](https://github.com/vunb/kites-template-express)
* [ ] `restful`: Template for generating a RESTful API Server, [nodevn/kites-template-restful](https://github.com/vunb/kites-template-restful)
* [ ] `spa`: Template for generating a Single Page Application (SPA)
* [ ] `cms`: Template for generating a Content Management System (CMS)
* [ ] `chat`: Template for generating a Chat application
* [x] `chatbot`: Template for generating an AI Chatbot application, [vntk/chatbot](https://github.com/vntk/chatbot), [document](https://github.com/vntk/chatbot)
* [ ] `videocall`: Template for generating a Video Call application
