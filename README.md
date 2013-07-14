http://api.github.com/repos/zeke/queriac-commands/contents

https://api.github.com/repos/zeke/queriac-commands/contents/bar.js?ref=master

// appAPI.ready(function($) {
//   // Retrieve all keys-value pairs from local database
//   appAPI.db.async.getList(function(arrayOfItems) {
//     // Process the result
//     for (var i = 0; i < arrayOfItems.length; i++) {
//       alert(
//         'Key: ' + arrayOfItems[i].key +
//         ' Value: ' + arrayOfItems[i].value +
//         ' Expiration: ' + arrayOfItems[i].expiration);
//     }
//   });
// });


// appAPI.ready(function($) {
//   appAPI.db.async.setFromRemote(
//     "http://example.com/api/get_something.json",
//     "key",
//     appAPI.time.minutesFromNow(10),
//     function(response) {
//       alert(response);
//     },
//     function(HttpCode) {
//       alert("HTTP code:" + HttpCode);
//   });
// });