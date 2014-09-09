var URL = require("url")
var async = require("async")
var superagent = require("superagent")
var atob = require("atob")
var pick = require("lodash.pick")
var pluck = require("lodash.pluck")
var user = "zeke"
var ghToken = "777d3e3234da21ed5e0cae6debec0d12bd729167"
var repoURL = URL.format({
  protocol: "https",
  auth: ghToken,
  host: "api.github.com",
  pathname: "/repos/" + user + "/queriac-commands/contents",
})
var commentPattern = new RegExp("^\/\/ ?")
var queriac = {
  commands: {}
}


var sync = module.exports = function(callback) {

  // // Don't fetch more than once every five minutes
  // if (typeof queriac != "undefined" && Date.now()-queriac.lastSyncedAt < 1000*60*5 ) {
  //   console.log("queriac synced recently")
  //   return callback(null)
  // }

  superagent.get(repoURL, function(err, res) {
    if (err) return callback(err)
    var urls = pluck(res.body, "url").map(function(url) {
      // Add auth token to each URL
      var parts = URL.parse(url)
      parts.auth = ghToken
      return URL.format(parts)
    })

    async.map(urls, superagent.get, function(err, commands){
      if (err) return callback(err)
      commands = pluck(commands, 'body')

      commands.forEach(function(command){

        // The filename is the command name
        var name = command.name.replace(/\.js$/i, "")

        // Decode the Base64 string that GitHub API returns
        var functionBody = atob(command.content.replace(" ", ""))

        queriac.commands[name] = {
          functionBody: functionBody
        }

        // Turn arguments into an array called `args`
        // queriac.commands[name].functionBody = function() {
        //   var args = Array.prototype.slice.apply(arguments)
        //   eval(content)
        // }

        // A comment on the first line of the file becomes the description.
        if (functionBody.match(commentPattern)) {
          queriac.commands[name].description = functionBody.split("\n")[0].replace(commentPattern, "")
        }

      })
      queriac.lastSyncedAt = Date.now()
      return callback(null, queriac)
    })
  })

}
