window.sync = require("./lib/sync")

if (typeof(appAPI) === "undefined") {
  window.appAPI = {
    ready: function(callback) { return callback(); }
  }
}

appAPI.ready(function($) {
  console.log("Hello from extension land!")
  sync(function(err, queriac){
    if (err) return console.error(err)
    console.log(queriac)
    console.log(JSON.stringify(queriac, null, 2))
  })
})
