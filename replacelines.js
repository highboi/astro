var fs = require("fs");

dir = "./views"

fs.readdir(dir, (error, list) => {
	list.filter((item) => {
		return item.includes(".ejs");
	});

	list.forEach((item, index) => {
		console.log(item);

		fs.readFile(dir + "/" + item, 'utf-8', (err, data) => {
			console.log(data);

			if (typeof data == "string") {
				data = data.replace("<%- include(\'content/html/banner.ejs\') %>", "<%- include(\'content/ejs/banner.ejs\') %>");
			}


			fs.writeFile(dir + "/" + item, data, (err) => {
				console.log("WROTE TO FILE");
			});
		});
	});
});
