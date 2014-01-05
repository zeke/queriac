var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var Queriac = (function() {

  function Queriac() {
    // Do some Scope binding nonsense
    var funks = ['init', 'close', 'exec', 'handleKeypress', 'handleShiftPress', 'open', 'updateStyles']
    for (var i in funks) this[funks[i]] = __bind(this[funks[i]], this)

    // document.addEventListener('DOMContentLoaded', this.init);
    this.init();
  }

  Queriac.prototype.init = function() {

    // Create container element
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'queriac');
    document.body.appendChild(this.el);

    // Create input element
    this.input = document.createElement('input');
    this.input.setAttribute('placeholder', 'Enter a command...');
    this.el.appendChild(this.input);

    // Event listeners
    document.addEventListener('keyup', this.handleKeypress);
    this.input.addEventListener('change', this.exec);
    this.input.addEventListener('blur', this.close);

    this.updateStyles();
  };

  Queriac.prototype.updateStyles = function() {

    // Container Styles
    var styles = {
      opacity: "0",
      background: "rgb(230, 230, 230)",
      border: "1px solid rgb(190, 190, 190)",
      transition: "all 0.25s",
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      '-webkit-transform': "translate(-50%, -50%)",
      'border-radius': "4px",
      padding: "10px",
      "box-shadow": "0px 5px 10px 1px rgba(0,0,0,0.3)",
      "z-index": "1000",
      "pointer-events": "none"
      // outline: "9999px solid rgba(0,0,0,.7)"
    }

    for (var key in styles) this.el.style[key] = styles[key]

    // Input Styles
    var styles = {
      width: "500px",
      'font-family': "'Helvetica Neue', helvetica, arial",
      'font-size': "24px",
      padding: "8px",
      outline: "none"
    }

    for (var key in styles) this.input.style[key] = styles[key]
  }

  Queriac.prototype.open = function() {
    // this.el.classList.add('active')
    this.updateStyles();
    this.el.style.opacity = "1"
    this.input.focus()
  };

  Queriac.prototype.close = function() {
    // this.el.classList.remove('active')
    this.el.style.opacity = "0"
    this.input.value = ""
  };

  Queriac.prototype.exec = function() {
    if (this.input.value != "") {
      var args = this.input.value.split(' ')
      var keyword = args.shift()

      // Find the given keyword's command in 'local storage'
      // The function will have access to the local `args` variable
      appAPI.db.async.get(keyword, function(command) {
        if (command) {
          eval(command)
        } else {
          console.error("Queriac command not found", keyword)
        }
      });
    }
    this.close()
  }

  // Open if shift was double-pressed
  Queriac.prototype.handleShiftPress = function(event) {
    if (this.prevShift && Date.now()-this.prevShift<300) this.open()
    this.prevShift = Date.now()
  }

  Queriac.prototype.handleKeypress = function(event) {
    switch(event.keyCode) {
      case 27: this.close(); // esc
      case 16: this.handleShiftPress(); // shift
    }
  };

  return Queriac;

})();

var GitHub = (function() {

  function GitHub() {}

  GitHub.delayBetweenRequests = 3000

  GitHub.getCommandList = function(user) {
    var githubCommandsUrl = "https://api.github.com/repos/" + user + "/queriac-commands/contents"
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

      // For some reason, github's API puts a newline at the end of the content string...
      var content = atob(command.content.replace(/\n/g, '')) // decode base64,
      // content = command.content

      appAPI.db.async.set(
        keyword,
        content//,
        // null, // set this to some time in the future
        // function() {
        //   console.log("saved command", keyword, content);
        // }
      );
    });
  };

  return GitHub;

})();

appAPI.ready(function($) {

  window.queriac = new Queriac();
  var user = "zeke"
  // GitHub.getCommandList(user);

  appAPI.db.async.getKeys(function(keys) {
    console.log(keys);
  });

})


