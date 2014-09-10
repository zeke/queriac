var URL = require("url")
var async = require("async")
var superagent = require("superagent")
var atob = require("atob")
var pick = require("lodash.pick")
var pluck = require("lodash.pluck")
var RateLimiter = require('limiter').RateLimiter
var limiter = new RateLimiter(1, 2000)
var user = "zeke"
var ghToken = "2e5a23e5341c1858baf6eefe20f66d20cc404530"
// var ghToken = "777d3e3234da21ed5e0cae6debec0d12bd729167"
// var ghToken = "6152ab8de3011e4be699842c5cd35bda0c755605"
var repoURL = URL.format({
  protocol: "https",
  query: {access_token: ghToken},
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
      var parts = URL.parse(url, true)

      //
      delete parts.search
      if(!parts.query) parts.query = {}
      parts.query.access_token = ghToken

      return URL.format(parts)
    })

    async.map(
      urls.slice(0, 500),

      function(url, callback) {
        limiter.removeTokens(1, function() {
          console.log(url)
          superagent.get(url, function(req, res) {
            return callback(null, res.body)
          })
        })
      },

      function(err, files){
        console.log(files)
        if (err) return callback(err)

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

          // A comment on the first line of the file becomes the description.
          if (functionBody.match(commentPattern)) {
            commands[name].description = functionBody.split("\n")[0].replace(commentPattern, "")
          }

        })
        return callback(null, commands)
      })
  })

}
