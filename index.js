var async = require("async")
var superagent = require("superagent")
var atob = require("atob")
var pluck = require("lodash.pluck")
var user = "zeke"
var repo = "https://api.github.com/repos/" + user + "/queriac-commands/contents"

var getCommands = function(callback) {

  // Don't fetch more than once every five minutes
  if (typeof queriac != "undefined" && Date.now()-queriac.lastSyncedAt < 1000*60*5 ) {
    console.log("queriac synced recently")
    return
  }

  window.queriac = {
    commands: {}
  }

  superagent.get(repo, function(err, res) {
    if (err) return callback(err)
    var urls = pluck(res.body, "url")
    async.map(urls, superagent.get, function(err, commands){
      if (err) return callback(err)
      commands.forEach(function(command){
        var name = command.body.name.replace(/\.js$/i, "")
        var script = function() {
          var args = Array.prototype.slice.apply(arguments)
          eval(atob(command.body.content.replace(" ", "")))
        }
        queriac.commands[name] = script
      })
      queriac.lastSyncedAt = Date.now()
      return callback(null)
    })
  })
}

getCommands(function(err){
  if (err) return console.error(err)
  console.log(queriac)
})
