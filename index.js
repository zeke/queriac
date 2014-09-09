var URL = require("url")
var async = require("async")
var superagent = require("superagent")
var atob = require("atob")
var pick = require("lodash.pick")
var pluck = require("lodash.pluck")
var user = "zeke"
var ghToken = "2e5a23e5341c1858baf6eefe20f66d20cc404530"
var repoURL = URL.format({
  protocol: "https",
  auth: ghToken,
  host: "api.github.com",
  pathname: "/repos/" + user + "/queriac-commands/contents",
})
var commentPattern = new RegExp("^\/\/ ?")

var getCommands = function(callback) {

  // Don't fetch more than once every five minutes
  if (typeof queriac != "undefined" && Date.now()-queriac.lastSyncedAt < 1000*60*5 ) {
    console.log("queriac synced recently")
    return callback(null)
  }

  window.queriac = {
    commands: {}
  }

  superagent.get(repoURL, function(err, res) {
    if (err) return callback(err)
    var urls = pluck(res.body, "url").map(function(url) {
      // Add auth token to each URL
      var parts = URL.parse(url)
      parts.auth = ghToken
      return URL.format(parts)
    })

    console.log(urls)

    async.map(urls, superagent.get, function(err, commands){
      if (err) return callback(err)
      commands = pluck(commands, 'body')

      commands.forEach(function(command){

        // The filename is the command name
        var name = command.name.replace(/\.js$/i, "")

        // Decode the Base64 string that GitHub API returns
        var content = atob(command.content.replace(" ", ""))

        queriac.commands[name] = {}

        // Turn arguments into an array called `args`
        queriac.commands[name].script = function() {
          var args = Array.prototype.slice.apply(arguments)
          eval(content)
        }

        // A comment on the first line of the file becomes the description.
        if (content.match(commentPattern)) {
          queriac.commands[name].description = content.split("\n")[0].replace(commentPattern, "")
        }

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
