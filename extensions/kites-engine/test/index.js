var path = require('path');

[
    'engine',
    'extensions/discover',
    // Always end
    // 'TearDownTest',
].forEach(script => {
    require(path.join(__dirname, script));
});