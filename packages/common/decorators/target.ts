import * as METADATA_KEY from '../constants/metadata.keys';
import * as interfaces from '../interfaces';
import { id } from '../utils/id';
import { Metadata } from './metadata';

export class Target implements interfaces.Target {

  public id: number;
  public type: interfaces.TargetType;
  public serviceIdentifier: interfaces.Token<any>;
  // public name: interfaces.QueryableString;
  public name: string;
  public metadata: Metadata[];

  public constructor(
    type: interfaces.TargetType,
    name: string,
    serviceIdentifier: interfaces.Token<any>,
    namedOrTagged?: (string | Metadata)
  ) {

    this.id = id();
    this.name = name;
    this.type = type;
    this.serviceIdentifier = serviceIdentifier;
    // this.name = new QueryableString(name || '');
    this.metadata = new Array<Metadata>();

    let metadataItem: interfaces.Metadata | null = null;

    // is named target
    if (typeof namedOrTagged === 'string') {
      metadataItem = new Metadata(METADATA_KEY.NAMED_TAG, namedOrTagged);
    } else if (namedOrTagged instanceof Metadata) {
      // is target with metadata
      metadataItem = namedOrTagged;
    }

    // target has metadata
    if (metadataItem !== null) {
      this.metadata.push(metadataItem);
    }

  }
}
