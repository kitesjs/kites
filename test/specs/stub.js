'use strict'
const test = require('tape');

test('Add two numbers', function (t) {
    t.equal(1 + '2', '3', 'Please make this test pass!');
    t.end();
})