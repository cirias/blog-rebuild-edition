var readline = require('readline');
var User = require('./models/User.js');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Your username: ", function(username) {
  rl.question("Your password: ", function(password) {
  		new User({username: username, password: password}).save(function(err) {
  			if (err) {
  				console.log(err);
  			} else {
  				console.log('Create user success.');
  			}
			rl.close();
  		});
	});
});