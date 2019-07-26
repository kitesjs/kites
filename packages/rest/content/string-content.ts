import { HttpContent } from './http-content';

const DEFAULT_MEDIA_TYPE = 'text/plain';

export class StringContent extends HttpContent {

  constructor(private content: string, private mediaType: string = DEFAULT_MEDIA_TYPE) {
    super();

    this.headers['Content-Type'] = mediaType;
  }

  public readAsStringAsync() {
    return Promise.resolve(this.content);
  }
}

const test = new StringContent('test');
