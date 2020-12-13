/*
CREATE BASIC VARIABLES
*/

//get the search bar element
var searchqueryinput = document.getElementById("searchquery");

//clear the search query value in order to prevent confusion.
//(if the user reloads the page with a query already typed in, then
//the webpage will not have any reccomendations to show to the user)
searchqueryinput.value = "";

//get the search reccomendation dropdown div
var searchDropdown = document.getElementById("searchrecs");

//create a timer variable for delaying the retrieval of search reccomendations
//until the user stops typing for a certain amount of time
var timer = 0;

//variables to check if the mouse is over the search reccomendations or over the search input
var mouseoverrecs = false;
var mouseoverquery = false;

//a variable to store the current reccomendation that the user is highlighting with their arrows
var highlightedrec;

//create a new xhttp object to make ajax requests
var xhttpSearch = new XMLHttpRequest();

/*
FUNCTIONS TO IMPLEMENT SEARCH RECCOMENDATIONS
*/

//recieve a response from the server
xhttpSearch.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
		//get the reccomendation arrays and delete duplicates with a set
		recsArr = JSON.parse(this.responseText);
		recsArr = [...new Set(recsArr)];

		//clear out the reccomendations html and add the p tags that contain reccomendations
		searchDropdown.innerHTML = "";
		recsArr.forEach((item, index) => {
			if (item.includes(searchqueryinput.value)) {
				var components = item.split(searchqueryinput.value);
				var rectext = components[0] + searchqueryinput.value + components[1];
				var hreflink = `/search/?searchquery=${rectext.split(" ").join("+")}`;
				searchDropdown.innerHTML = searchDropdown.innerHTML + `<p><a href=\'${hreflink}\'>` + components[0] + "<strong>" + searchqueryinput.value + "</strong>" + components[1] + "</a></p>";
			} else {
				var rectext = searchqueryinput.value + " " + item;
				var hreflink = `/search/?searchquery=${rectext.split(" ").join("+")}`;
				searchDropdown.innerHTML = searchDropdown.innerHTML + `<p><a href=\'${hreflink}\'><strong>` + searchqueryinput.value + " </strong>" + item + "</a></p>";
			}
		});
	}
};

//a function to respond to the "keyup" event on the search bar
function keyupSearch() {
	//clear the previous timeout if it has not executed the get request
	clearTimeout(timer);

	//set the timer to have a new timeout function for getting the search reccomendations
	timer = setTimeout(getSearchRec, 500);
}

//function to make a get request for search reccomendations
function getSearchRec() {
	//check to see if the searchbar value is nothing
	if (searchqueryinput.value != "") {
		var searchquery = searchqueryinput.value.split(" ").join("+");

		xhttpSearch.open("GET", `/getsearchrecs/?searchquery=${searchquery}`, true);
		xhttpSearch.send();

		searchDropdown.style.display = "block";
	} else {
		searchDropdown.style.display = "none";
	}
}

/*
PROGRAM EVENTS TO RESPOND TO KEYS AND MOUSE FOR STYLING
*/

//set an event so that if the user clicks/hovers over the dropdown, then reccomendations will not
//disappear. NOTE: use the "onmouseenter", which fires only once when entering the element, instead
//of the "onmouseover", which fires repeatedly as the user moves the mouse inside the element.
searchDropdown.onmouseenter = () => {
	mouseoverrecs = true;
};

//set an event that sets the "mouseoverrecs" value to false if the mouse leaves the search reccomendations
//NOTE: the "onmouseout" event checks an element's children, which is bad in this case, use "onmouseleave",
//which only checks if the mouse has left the parent element
searchDropdown.onmouseleave = () => {
	mouseoverrecs = false;
	if (!mouseoverquery) {
		searchDropdown.style.display = "none";
	}
};

//whenever the user clicks off of the search query input (aka they "blur" focus of the input),
//set the reccomendations to display nothing
searchqueryinput.onblur = () => {
	mouseoverquery = false;
	//make the reccomendations disappear only if the mouse is not clicking on/hovering over the
	//reccomendations to pick from
	if (!mouseoverrecs) {
		searchDropdown.style.display = "none";
	}
};

//whenever the user clicks ("focuses") on the search query input again (to change the search query),
//set the reccomendations to display themselves
searchqueryinput.onfocus = () => {
	mouseoverquery = true;
	searchDropdown.style.display = "block";
};

/*
PROGRAM FUNCTIONALITY FOR ARROW KEYS IN SELECTING RECCOMENDATIONS
*/

//monitor for arrow keys in order to highlight search reccomendations
searchqueryinput.onkeydown = (event) => {
	//check for arrow keys
	switch (event.key) {
		case "ArrowUp":
			//get the child nodes of the search dropdown in a variable to not retrieve the list EVERY TIME we need it (this would slow the page)
			var children = searchDropdown.childNodes;
			//check to see if the highlightedrec variable is undefined, set it to the last child node in the
			//search dropdown because the up arrow key loops back to the last one
			if (typeof highlightedrec == 'undefined') {
				//assign an object to this variable with the last index of the children and the text of the last element of the children
				highlightedrec = {index: children.length-1, text: children[children.length-1].innerText }
			} else { //if the highlighedrec is already defined
				//if the next decrement of the index is less than 0, set the next index to be the last element
				if (highlightedrec.index-1 < 0) {
					var nextindex = children.length - 1;
				} else { //set the last index to one less than the previous index modded with the children length (modding creates a looping effect)
					var nextindex = (highlightedrec.index-1)%children.length;
				}
				//defined the object with the index and the text of this index in the children
				highlightedrec = {index: nextindex, text: children[nextindex].innerText}
			}
			//change the background color of this element to a slightly darker color
			children[highlightedrec.index].style.backgroundColor = "#adde12";
			//change the background color of all of the other elements back to the original color
			children.forEach((item, index) => {
				if (index != highlightedrec.index) {
					item.style.backgroundColor = "#adff12";
				}
			});
			//change the search query input
			searchqueryinput.value = highlightedrec.text;
			break;
		case "ArrowDown":
			//get the children of the search dropdown
			var children = searchDropdown.childNodes;
			//check if the highlightedrec is undefined
			if (typeof highlightedrec == 'undefined') {
				//if the highlightedrec is undefined, assign the first element to the object (down arrow)
				highlightedrec = {index: 0, text: children[0].innerText};
			} else {
				//get the next index and mod it with the children length (this creates a looping effect, so if the next one is 5 then 5%5 --> 0,
				//back to the beginning)
				var nextindex = (highlightedrec.index+1)%children.length;
				//assign the next element to the object
				highlightedrec = {index: nextindex, text: children[nextindex].innerText};
			}
			//change the background color of this element to a slightly darker color
			children[highlightedrec.index].style.backgroundColor = "#adde12";
			//change the background color of all of the other elements back to the original color
			children.forEach((item, index) => {
				if (index != highlightedrec.index) {
					item.style.backgroundColor = "#adff12";
				}
			});
			//change the search query input
			searchqueryinput.value = highlightedrec.text;
			break;
	}
};
