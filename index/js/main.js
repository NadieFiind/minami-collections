function updateSectionsContainer() {
	/* Update the height of the sections container to move the elements below it. */
	setTimeout(() => {
		s("#sections-container").style.height = getCurrentSection().offsetHeight + "px";
	}, 300);
}
function getCurrentSection() {
	switch (s("#sections-container").style.left) {
		case "0%":
			return s("#discography-sec");
		case "-100%":
			return s("#covers-sec");
		case "-200%":
			return s("#livestreams-sec");
		case "-300%":
			return s("#others-sec");
		default:
			return s("#discography-sec");
	}
}

// create the tracks elements
new Discography("#discography-sec", data.discography).createTracks();
new Covers("#covers-sec", data.covers).createTracks();
new Livestreams("#livestreams-sec", data.live_streams).createTracks();
new Others("#others-sec", data.others).createTracks();

// window events
window.addEventListener("load", updateSectionsContainer);
window.addEventListener("resize", updateSectionsContainer);