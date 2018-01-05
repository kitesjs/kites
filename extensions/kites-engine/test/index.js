var path = require('path');

[
    'extensions/discover',
    // Always end
    // 'TearDownTest',
].forEach(script => {
    require(path.join(__dirname, script));
});