import { HttpContent } from './http-content';

const DEFAULT_MEDIA_TYPE = 'application/json';

export class JsonContent extends HttpContent {
  private content: string;

  constructor(content);
  constructor(content: any, mediaType: string);
  constructor(content: any, private mediaType: string = DEFAULT_MEDIA_TYPE) {
    super();

    this.content = JSON.stringify(content);
    this.headers['Content-Type'] = mediaType;
  }

  public readAsStringAsync() {
    return Promise.resolve(this.content);
  }
}
