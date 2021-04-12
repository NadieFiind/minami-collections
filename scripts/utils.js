function s(selector, all) {
	if (all) {
		return document.querySelectorAll(selector);
	} else {
		return document.querySelector(selector);
	}
}
function e(element) {
	return document.createElement(element);
}
function addChildren(parent, children) {
	for (let child of children) {
		parent.appendChild(child);
	}
}
function toggle(element, class_="toggled") {
	element.classList.toggle(class_);
}
function goTo(element) {
	element.scrollIntoView({
		behavior: "smooth"
	});
}