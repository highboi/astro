//get the gun object to interact with
gun = GUN();

/*
GET DATA ON GUN DB
*/
function getGunData(id) {
	return new Promise((resolve, reject) => {
		gun.get(id).once((data, key) => {
			resolve(data);
		});
	});
}

/*
STORE THE CURRENT WEBPAGE
*/
function storeCurrentPage() {
	//get the current url the user is on
	var currentURL = window.location.pathname;

	//get the entire document text of the current page
	var documentText = document.documentElement.outerHTML;

	//store the webpage
	gun.get(currentURL).put({
		document_html: documentText
	});

	return;
}

/*
TRY TO GET THE CURRENT WEBPAGE FROM THE P2P DATABASE
*/
async function getCurrentPage() {
	//get the current url the user is on
	var currentURL = window.location.pathname;

	//get the current webpage text through gun js
	var current_doc = await getGunData(currentURL);

	return current_doc;
}


/*
MAIN GUN JS FUNCTIONALITY
*/
(async () => {
	//store the current document on gun
	storeCurrentPage();

	//get all of the link elements on the current page
	var link_elements = document.getElementsByTagName("a");
	link_elements = Array.from(link_elements);

	//extract the links for each anchor on the current page
	var page_links = [];
	link_elements.forEach((item, index) => {
		//get the full relative path of the current webpage
		var full_link = item.pathname + item.search;

		//add this link to the page_links array
		page_links.push(full_link);
	});

	//get the document bodys stored on gun js
	var texts = [];
	for (var index in page_links) {
		var link = page_links[index];

		var gunlink = await getGunData(link);

		if (gunlink != undefined) {
			texts.push(gunlink.document_html);
		} else {
			texts.push(gunlink);
		}
	}

	console.log(texts);

	//add event listeners for each anchor tag
	link_elements.forEach((item, index) => {
		item.onclick = (event) => {
			//get the document text associated with this link on gun js
			var document_text = texts[index];

			//if gun has this link stored, then redirect the user without requesting the server
			if (document_text != undefined) {
				//replace the current entry in the session history with the link the user clicked on
				history.replaceState(null, "", page_links[index]);

				//write the gun-stored document text to the page
				document.open();
				document.write(document_text);
				document.close();
			}
		};
	});
})();
