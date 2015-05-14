var fs = require('fs');

var pkg = fs.readFileSync('package.json');
var spawn = require('child_process').spawn;

try{
	pkg = JSON.parse(pkg);
	leanifyPackage();
	grabPackages();
} catch (err){
	console.log('package.json does not exist or is not in correct format');
}

function leanifyPackage(){
	var plugins = pkg.cordovaPlugins;
	var newPlugins = [];
	for (var i = 0; i < plugins.length; i++){
		if (newPlugins.indexOf(plugins[i]) === -1){
			newPlugins.push(plugins[i]);
		}
	}
	pkg.cordovaPlugins = newPlugins;
	var json = JSON.stringify(pkg, null, 2);
	fs.writeFileSync('package.json', json);
}

function grabPackages(){
	var plugins = pkg.cordovaPlugins;
	var i = 0;
	retrieve();

	function retrieve(){
		var plugin = plugins[i];
		execute('ionic plugin rm ' + plugin, function(){
			execute('ionic plugin add '+ plugin, function(){
				i++;
				if (i < plugins.length) retrieve();
			})
		})
	}
}

function execute(cmd, cb){
	params = cmd.split(' ');
	cmd = params.shift();

	ls = spawn(cmd, params);
	
	ls.stdout.on('data', function (data) {
	  console.log('stdout: ' + data);
	});

	ls.stderr.on('data', function (data) {
	  console.log('stderr: ' + data);
	});

	ls.on('close', function (code) {
	  console.log('child process exited with code ' + code);
	  cb();
	});
}
