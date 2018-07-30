var path = require('path');

/**
 * Import specs
 */
var specs = '../test/specs/';
[
    // 'stub',
    'kites',
].forEach(script => {
    require(path.join(specs, script));
});
