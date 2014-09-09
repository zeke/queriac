var GitHub = (function() {

  function GitHub() {}

  GitHub.delayBetweenRequests = 3000

  GitHub.getCommandList = function(user) {
    var githubCommandsUrl = "http://api.github.com/repos/" + user + "/queriac-commands/contents"
    appAPI.request.get(githubCommandsUrl, function(data) {
      var files = JSON.parse(data);
      for (var i in files) {
        var url = files[i].url
        setTimeout(
          function(u) {
            return function() { GitHub.saveCommand(u) }
          }(url), GitHub.delayBetweenRequests*i
        )
      }

    })
  }

  GitHub.saveCommand = function(url) {
    appAPI.request.get(url, function(data) {
      var command = JSON.parse(data);
      var keyword = command.name.replace('.js', '')
      var content = atob(command.content.replace(' ', '')) // decode base64
      appAPI.db.async.set(
        keyword,
        content,
        null,
        function() { console.log("saved command", keyword, content); }
      );
    });
  };

  return GitHub;

})();

appAPI.ready(function($) {
  var user = "zeke"
  GitHub.getCommandList(user);
})
