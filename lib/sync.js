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
var jsExtension = new RegExp("\.js$", "i")
var specialFilename = new RegExp("^_")
var commands = {}

var sync = module.exports = function(callback) {

  superagent.get(repoURL, function(err, res) {
    if (err) return callback(err)
    var urls = pluck(res.body, "url").map(function(url) {
      // Add auth token to each URL
      var parts = URL.parse(url)
      parts.auth = ghToken
      return URL.format(parts)
    })

    async.map(urls, superagent.get, function(err, files){
      if (err) return callback(err)
      files = pluck(files, 'body')

      files.forEach(function(file){

        // Skip files that don't have a .js extension
        if (!file.name.match(jsExtension)) return

        // Skip "special" files that start with underscores
        if (file.name.match(specialFilename)) return

        // The filename is the command name
        var name = file.name.replace(jsExtension, "")

        // Decode the Base64 string that GitHub API returns
        var functionBody = atob(file.content.replace(" ", ""))

        commands[name] = {
          functionBody: functionBody
        }

        // Turn arguments into an array called `args`
        // commands[name].functionBody = function() {
        //   var args = Array.prototype.slice.apply(arguments)
        //   eval(content)
        // }

        // A comment on the first line of the file becomes the description.
        if (functionBody.match(commentPattern)) {
          commands[name].description = functionBody.split("\n")[0].replace(commentPattern, "")
        }

      })
      return callback(null, commands)
    })
  })

}
