import { IKitesOptions, KitesInstance } from '@kites/engine';

export class Kites extends KitesInstance {
    constructor(options: IKitesOptions) {
        super(options);
    }

    /**
     * Thiết lập giá trị cấu hình cho các extensions
     * Example:
     *      .set('express:static', './assets') -> kites.options.express.static = './assets'
     * @param option
     * @param value
     */
    set(option: string, value: string) {
        const tokens = option.split(':');
        if (tokens.length === 2) {
            this.options[tokens[0]][tokens[1]] = value;
        } else if (tokens.length === 1) {
            this.options[tokens[0]] = value;
        }
    }
}
