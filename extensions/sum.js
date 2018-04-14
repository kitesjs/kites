/**
 * A simple extension help sum array of numbers
 * @param {kites} kites 
 */
module.exports = function (kites) {
    kites.sum = function (arr) {
        return (arr || []).reduce((a, b) => a + b, 0);
    }
}