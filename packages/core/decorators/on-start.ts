// /**
//  * Fire start events immediately after system startup
//  */
// export function OnStart(config: any) {
//   return function (target, key, descriptor) {
//     config["type"] = "OnStart";
//     config["target"] = target.constructor;
//     config["method"] = key;
//     addConfig(config);
//     return descriptor;
//   }
// }
