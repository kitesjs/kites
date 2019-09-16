import * as mkdirp from 'mkdirp';
import * as multer from 'multer';

/**
 * Khởi tạo disk storage cho việc lưu trữ file
 * - Lưu trữ upload file theo user hoặc group
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const now = new Date();
    const userDir = '/content/uploads/' + req.param('user', `${now.getFullYear()}/${now.getMonth()}/${now.getDate()}`);
    const uploadDir = req.kites.appDirectory + userDir;
    (req as any).uploadDir = userDir;
    mkdirp(uploadDir, err => {
      cb(null, uploadDir);
    });
  },
  filename(req, file, cb) {
    // TODO: Generate unique file name
    cb(null, file.originalname);
  },
});

/**
 * Lưu file buffer trong memory
 */
const uploadMemory = multer({ storage: multer.memoryStorage() });

/**
 * config upload storage
 */
const upload = multer({ storage });

export {
  upload,
  uploadMemory,
};
