/**
 * Extensions sorter
 * 
 * @param {Object} pa 
 * @param {Object} pb 
 */
module.exports = function (pa, pb) {
    
    // Extension is a node module
    // -> Sort by dependencies length
    pa.dependencies = pa.dependencies || [];
    pb.dependencies = pb.dependencies || [];

    if (pa.dependencies.length > pb.dependencies.length) return 1;
    if (pa.dependencies.length < pb.dependencies.length) return -1;

    return 0;
}