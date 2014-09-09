var sync = require("./lib/sync")

if (typeof(appAPI) !== "undefined") {
  appAPI.ready(function($) {
    sync(function(err, queriac){
      if (err) return console.error(err)
      console.log(queriac)
    })
  })
} else {
  console.log("appAPI not defined")
}
