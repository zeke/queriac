window.sync = require("./lib/sync")
window.fmt = require("util").format

if (typeof(appAPI) === "undefined") {
  return console.log("not in extension context")
}

appAPI.ready(function($) {

  // console.log(appAPI.dom)

  appAPI.db.async.getList(function(items){

    if (items.length) {
      var commands = JSON.parse(items[0].value)
      console.log("Found commands in extension database!", commands)
      appAPI.dom.addInlineJS(fmt("window.commands=JSON.parse(%j)", JSON.stringify(commands)))
      appAPI.dom.addRemoteJS("http://localhost:9000/ui.js")
      return;
    }

    sync(function(err, commands){
      console.log("original", commands)
      if (err) return console.error(err)
      appAPI.db.async.set(
        'commands',
        JSON.stringify(commands, null, 2),
        appAPI.time.minutesFromNow(30),
        function(){
          console.log("Saved commands")
        }
      )
    })

  })

})
