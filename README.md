# Queriac (Experimental)

This is an extension that gives you a univeral javascript command line in your browser. Set up a github repository full of javascript files, and each file becomes a command.

## Setup

- Create a github repo called `queriac-commands` and fill it up with scripts
- Each script will become a queriac command

## Examples

```js
// foo.js
alert("foo");
```

```js
// g.js
location="http://google.com/search?q=" + query;
```