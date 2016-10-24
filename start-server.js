var express = require('express');
var app = express();

app.use(express.static('../gh-pages/'));

app.listen(80, function () {
  setTerminalTitle('localhost:80');
  console.log('Express listening on port 80!');
});

function setTerminalTitle(title)
{
  process.stdout.write(
    String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
  );
}