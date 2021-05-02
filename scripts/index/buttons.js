function toggleMenu() {
	toggle(s("#menu-btn > img"));
	toggle(s("#menu"));
}

function selectSection(index, selector) {
	for (let button of s(".ssb", true)) {
		button.classList.remove("toggled");
	}
	toggle(selector);
	s("#sections-container").style.left = `-${index * 100}%`;
	updateSectionsContainer();
}
