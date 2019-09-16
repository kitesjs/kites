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

  @Post('/', upload.single('datafile'))
  uploadFile(
    @Request() req,
  ) {
    this.kites.logger.info('Upload file success!');
    const msg = 'upload ok!';
    const filename = req.file.filename;
    return {msg, filename};
  }

  @Post('/:id')
  readFile(@RequestParam('id') id) {
    this.kites.logger.info('Upload file success!');

    const msg = 'upload ok!';
    return {msg, id};
  }

}
