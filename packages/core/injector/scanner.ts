import { IKites, KitesInstance } from '../engine/kites-instance';

export class DependenciesScanner {

  constructor(
    private readonly kites: KitesInstance
  ) { }

  public scan() {
    const extensions = this.kites.extensionsManager.extensions;
    for (const ext of extensions) {
    }
  }
}
