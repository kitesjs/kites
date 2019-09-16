import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { Controller, Post, Request, RequestParam } from '@kites/rest';

import { upload, uploadMemory } from './upload.multer';

@Controller('/upload')
export class UploadController {

  constructor(
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
  ) {
    kites.logger.info('Hello %s controller!!! (%s)', 'upload', 3);
  }

  @Post('/', upload.single('upload_file'))
  uploadFile(
    @Request() req,
  ) {
    this.kites.logger.info('Upload file success!');
    const msg = 'upload ok!';
    const filename = req.file.filename;
    return {msg, filename};
  }

  @Post('/:user', uploadMemory.single('upload_file'))
  readFile(@RequestParam('user') user, @Request() req) {
    this.kites.logger.info('Read upload file successfully!');

    const msg = 'upload ok!';
    const greet = 'hello ' + user;
    const text = req.file.buffer.toString('utf-8');
    return {msg, greet, text};
  }

}
