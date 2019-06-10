import { KitesExtension } from './extensions';

export default function sorter(ea: KitesExtension, eb: KitesExtension) {
    // Extension is a node module
    // -> Sort by dependencies length
    ea.dependencies = ea.dependencies || [];
    eb.dependencies = eb.dependencies || [];

    if (ea.dependencies.length > eb.dependencies.length) return 1;
    if (ea.dependencies.length < eb.dependencies.length) return -1;

    return 0;
}
