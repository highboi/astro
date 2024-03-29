//a file for verifying/checking the form inputs on ad edits

//a function for checking bad inputs on the form
async function verifyAdEditForm(formid) {
	//check for empty required inputs
	if (!checkFormInputs(formid)) {
		return false;
	}

	//check for a valid relative url
	var businessLink = document.querySelector(`#${formid} #businessLink`);
	var relativeURLRegex = new RegExp("^(\/)[^ :]*");
	if (!businessLink.value.match(relativeURLRegex)) {
		alert("Invalid URL for advertisement, use relative URLs such as /example or /index.html (/ for the landing page).");
		return false;
	}

	//check for a valid image with accepted dimensions
	var adImage = document.querySelector(`#${formid} #adImage`);
	if (adImage.files.length) {
		//get the image file to check
		var imgFile = adImage.files[0];

		//check for accepted dimensions
		var acceptedDimensions = await getAdDimensions();
		var imgResMatch = await checkImgResolution(imgFile, acceptedDimensions);
		if (!imgResMatch) {
			alert("Image is not one of the accepted dimensions.");
			return false;
		}

		//check for accepted mime types
		var imgTypes = await getImgTypes();
		if (!imgTypes.includes(imgFile.type)) {
			alert(`Image is not one of the accepted MIME types, please use one of these: ${imgTypes}`);
			return false;
		}
	}

	//check file signatures
	var fileVerify = await verifyFileSignatures(formid);
	if (!fileVerify) {
		return false;
	}

	//check file sizes
	var fileSizeCheck = await checkFileSizes(formid, 4000000);
	if (!fileSizeCheck) {
		return false;
	}

	return true;
}

//the function triggered on submission of ad edits
async function advertEditSubmitted() {
	//disable the form and activate a loading animation
	formLoadingState("adEditForm");

	//verify the validity of the form and it's inputs
	var verifyResult = await verifyAdEditForm("adEditForm");
	if (!verifyResult) {
		formLoadingState("adEditForm", true);
		return false;
	}

	//re-enable form elements for submission
	for (var element of document.getElementById("adEditForm").elements) {
		element.disabled = false;
	}

	//send the data to be stored and handle the upload progress
	var response = await makeRequest("POST", "/adedit", new FormData(document.getElementById("adEditForm")), (event) => {
		//calculate the percentage of the upload completed and display it
		var percentage = (event.loaded / event.total)*100;
		document.querySelector("#adEditForm .percentage").innerText = `${percentage}%`;
	});

	//check the response status
	if (response.status >= 200 && response.status < 300) {
		alert("Changes applied!");
		window.location.href = "/adstats";
		return true;
	} else {
		alert("There was an error with our server! Please try again.");
		return false;
	}
}
