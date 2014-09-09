window.sync = require("./lib/sync")

if (typeof(appAPI) === "undefined") {
  return console.log("not running in extension; bailing")
}

appAPI.ready(function($) {
  appAPI.db.async.getList(function(items){

    if (items.length) {
      var commands = JSON.parse(items[0].value)
      console.log("Found commands in extension database!", commands)
      return;
    }

    sync(function(err, commands){
      console.log("original", commands)
      if (err) return console.error(err)
      appAPI.db.async.set(
        'commands',
        JSON.stringify(commands, null, 2),
        appAPI.time.secondsFromNow(30),
        function(){
          console.log("Saved commands")
        }
      )
    })

  })

})
