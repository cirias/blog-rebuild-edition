var readline = require('readline');
var User = require('./models/User.js');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// var array = [1,2,3,4,5,6,7,8,9,10];
// console.log(array.filter(function(n) {
//   return n>5;
// }).map(function(n) {
//   return n = n + 1;
// }));


rl.question("Your username: ", function(username) {
  rl.question("Your password: ", function(password) {
  		new User({username: username, password: password}).save(function(err) {
  			if (err) {
  				console.log(err);
  			} else {
  				console.log('Create user success.');
  			}
  			
        rl.question("Pause...", function() {
          rl.close();
        });
  		});
	});
});