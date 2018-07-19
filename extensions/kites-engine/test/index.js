var path = require('path');

[
    'engine',
    'extensions/discover',
    // 'extensions/sorter',
].forEach(script => {
    require(path.join(__dirname, script));
});