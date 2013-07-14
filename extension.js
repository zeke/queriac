var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Q = (function() {

  function Q() {
    // Do some Scope binding nonsense
    var funks = ['init', 'close', 'exec', 'handleKeypress', 'handleShiftPress', 'open']
    for (var i in funks) this[funks[i]] = __bind(this[funks[i]], this)

    document.addEventListener('DOMContentLoaded', this.init);
  }

  Q.prototype.init = function() {
    this.addElement();
    this.addElementInput();
    document.addEventListener('keyup', this.handleKeypress);
  };

  Q.prototype.addElement = function() {

    // Create DOM element
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'queriac');
    document.body.appendChild(this.el);

    // Add Styles
    var styles = {
      opacity: "0",
      background: "rgb(230, 230, 230)",
      border: "1px solid rgb(190, 190, 190)",
      transition: "all 0.25s",
      translate: "all 0.25s",
      position: "absolute",
      top: "35%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      '-webkit-transform': "translate(-50%, -50%)",
      'border-radius': "3px",
      padding: "10px",
      "box-shadow": "0 5px 30px rgba(0,0,0,0.2)"
    }

    for (var key in styles) this.el.style[key] = styles[key]
  };

  Q.prototype.addElementInput = function() {

    // Create element
    this.input = document.createElement('input');
    this.input.setAttribute('placeholder', 'Enter a command...');
    this.el.appendChild(this.input);

    // Add Styles
    var styles = {
      width: "400px",
      'font-family': "'Helvetica Neue', helvetica, arial",
      'font-weight': "bold",
      'font-size': "24px",
      padding: "8px",
      outline: "none"
    }

    for (var key in styles) this.input.style[key] = styles[key]

    this.input.addEventListener('change', this.exec);
    this.input.addEventListener('blur', this.close);
  }

  Q.prototype.open = function() {
    // this.el.classList.add('active')
    // this.el.style.display = "block"
    this.el.style.opacity = "1"
    this.el.style.top = "30%"
    this.input.focus()
  };

  Q.prototype.close = function() {
    this.el.style.opacity = "0"
    this.el.style.top = "35%"
    this.input.value = ""
  };

  Q.prototype.exec = function() {
    if (this.input.value != "") {
      var args = this.input.value.split(' ')
      var keyword = args.shift()
      var query = args.join(' ')
      var func = "alert(query);"
      eval(func)
    }
    this.close()
  }

  // Open if shift was double-pressed
  Q.prototype.handleShiftPress = function(event) {
    if (this.prevShift && Date.now()-this.prevShift<300) this.open()
    this.prevShift = Date.now()
  }

  Q.prototype.handleKeypress = function(event) {
    switch(event.keyCode) {
      case 27: this.close(); // esc
      case 16: this.handleShiftPress(); // shift
    }
  };

  return Q;

})();

new Q();