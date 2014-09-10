window.sync = require("./lib/sync")
window.fmt = require("util").format
window.host = "http://localhost:9000"

if (typeof(appAPI) === "undefined") {
  return console.log("not in extension context")
}

window.inject = function(commands) {
  appAPI.dom.addInlineJS(fmt("window.commands=JSON.parse(%j)", JSON.stringify(commands)))
  appAPI.dom.addRemoteJS(fmt("%s/ui.js", host))
}

appAPI.ready(function($) {
  // appAPI.db.removeAll()
  appAPI.db.async.getList(function(items){

    if (items.length) {
      var commands = JSON.parse(items[0].value)
      console.log("Found cached commands", commands)
      inject(commands)
      return
    }

    sync(function(err, commands){
      console.log("original", commands)
      if (err) return console.error(err)
      appAPI.db.async.set(
        'commands',
        JSON.stringify(commands, null, 2),
        appAPI.time.minutesFromNow(300),
        function(){
          console.log("Saved commands")
          inject(commands)
        }
      )
    })
  })
})
