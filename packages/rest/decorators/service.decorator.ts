import _ from 'lodash';

export interface DecoratorProperty {
  property: string;
  value: any;
  required: boolean;
  process: (target: any) => void;
  checkRequired: () => boolean;
}

export class ServiceDecorator {
  protected decorator: string;
  protected properties: DecoratorProperty[];

  constructor(decorator: string) {
    this.decorator = decorator;
    this.properties = [];
  }

  /**
   * withProperty
   */
  public withProperty(property: string, value: any, required: boolean) {
    this.properties.push({
      checkRequired: () => required && !value,
      process: (target: any) => {
        target[property] = value;
      },
      property: property,
      required: required,
      value: value
    });
    return this;
  }

  /**
   * decorateTypeOrMethod
   */
  public decorateTypeOrMethod(args: any[]) {
    args = _.without(args, undefined);
    if (args.length === 1) {
    }
  }

  protected checkRequiredValue() {
    this.properties.forEach(p => {
      if (p.checkRequired()) {
        throw new Error(`Invalid ${this.decorator} decorator declaration: ${p.property}`);
      }
    });
  }

}
