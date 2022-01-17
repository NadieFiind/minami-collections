class Player {
	constructor() {
		this.audio = s("audio");
		this.setupAudio();
		
		this.tracks = [];
		this.origTracks = [];
		this.currentTrack = null;
		
		this.stopped = true;
		this.shuffle = false;
		this.repeat = false;
	}
	setupAudio() {
		function colon(number) {
			let num = number + "";
			return num.replace(/(.{2})$/,':$1');
		}
		function pad(num, size) {
			let s = num + "";
			while (s.length < size) s = "0" + s;
			return s;
		}
		function toTime(num) {
			let minutes = Math.floor(num / 60);
			let seconds = Math.floor(num - minutes * 60);
			return "" + minutes + pad(seconds, 2);
		}
		
		let bar = s("#bar");
		let max = s("#max");
		let current = s("#current");
		
		this.audio.onplay = () => this.currentTrack.play(true);
		this.audio.onpause = () => this.currentTrack.pause();
		this.audio.onloadedmetadata = () => {
			bar.max = this.audio.duration;
			max.textContent = colon(pad(toTime(bar.max), 3));
		};
		this.audio.ontimeupdate = () => {
			bar.value = this.audio.currentTime;
			current.textContent = colon(pad(toTime(bar.value), 3));
		};
		this.audio.onended = () => {
			this.next();
		};
		
		bar.oninput = () => {
			if (!this.stopped) {
				this.audio.currentTime = bar.value;
				this.currentTrack.play(true);
			}
		};
	}
	play() {
		if (s("#play-btn").classList.contains("playing")) {
			this.currentTrack.pause(); 
		} else {
			if (this.currentTrack) {
				this.currentTrack.play(true); 
			} else {
				this.tracks[0].play();
			}
		}
	}
	prev() {
		if (this.audio.currentTime < 5) {
			let index = this.tracks.indexOf(this.currentTrack) - 1;
			
			if (!this.tracks[index]) {
				index = 0;
			}
			
			if (!this.stopped) {
				this.tracks[index].play();
			}
		} else {
			this.audio.currentTime = 0;
		}
	}
	next() {
		let index = this.tracks.indexOf(this.currentTrack) + 1;
		
		if (!this.tracks[index]) {
			if (this.repeat) {
				index = 0;
			} else {
				this.stop();
				return;
			}
		}
		
		if (!this.stopped) {
			this.tracks[index].play();
		}
	}
	stop() {
		for (let track of this.tracks) {
			track.prevTrack = null;
		}
		this.currentTrack.element.classList.remove("selected");
		this.currentTrack.gif.classList.remove("selected");
		
		this.currentTrack = null;
		this.stopped = true;
		
		this.audio.pause();
		this.audio.currentTime = 0;
		s("#max").textContent = "0:00";
		
		s("#lyrics").innerHTML = "";
	}
	toggleShuffle() {
		function shuffleArray(array) {
			let currentIndex = array.length, temporaryValue, randomIndex;
			while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
			return array;
		}
		
		this.shuffle = !this.shuffle;
		s("#shuf-btn").classList.toggle("btn-on");
		
		if (this.shuffle) {
			shuffleArray(this.tracks);
		} else {
			this.tracks = [...this.origTracks];
		}
	}
	toggleRepeat() {
		this.repeat = !this.repeat;
		s("#rept-btn").classList.toggle("btn-on");
	}
	render() {
		for (let track of this.tracks) {
			let content = e("button");
			content.classList.add("content", "btn");
			content.addEventListener("click", () => track.play());
			track.element = content;
			
			let title = e("p");
			title.textContent = track.title;
			
			let info = e("span");
			info.textContent = track.info;
			
			let gif = e("img");
			gif.classList.add("playing-gif");
			gif.src = "/img/player/track_playing.gif";
			gif.alt = "Now playing...";
			track.gif = gif;
			
			addChildren(content, [title, info, gif]);
			addChildren(s("#tracklist"), [content]);
		}
	}
}
class Track {
	constructor(title, info, lyrics, src) {
		this.title = title;
		this.info = info;
		this.lyrics = lyrics;
		this.romajiLyrics = true;
		this.src = src;
		this.element = null;
		this.gif = null;
	}
	play(keepSRC) {
		for (let track of player.tracks) {
			track.element.classList.remove("selected");
			track.gif.classList.remove("selected");
		}
		this.element.classList.add("selected");
		this.gif.classList.add("selected");
		
		if (!keepSRC) {
			player.audio.src = this.src;
		}
		player.audio.play();
		
		s("#play-btn").classList.add("playing");
		
		player.stopped = false;
		player.currentTrack = this;
		
		this.showLyrics();
	}
	pause() {
		this.gif.classList.remove("selected");
		s("#play-btn").classList.remove("playing");
		player.audio.pause();
	}
	showLyrics() {
		let lyricsContainer = s("#lyrics");
		lyricsContainer.innerHTML = "";
		
		let title = e("h1");
		let info = e("p");
		let lyrics = e("p");
		
		let switchLyricsBtn = e("button");
		switchLyricsBtn.classList.add("btn");
		switchLyricsBtn.style.right = "10px";
		
		if (window.matchMedia("(max-width: 576px)").matches) {
			switchLyricsBtn.style.bottom = s("#controls").offsetHeight + 5 + "px";
		} else {
			switchLyricsBtn.style.bottom = "5px";
		}
		
		switchLyricsBtn.addEventListener("click", () => {
			this.romajiLyrics = !this.romajiLyrics;
			this.showLyrics();
		});
		
		if (this.lyrics === "none") {
			title.textContent = this.title;
			info.textContent = this.info;
			lyrics.textContent = "Lyrics not available.";
		} else if (this.lyrics) {
			title.textContent = this.title;
			if (this.romajiLyrics) {
				info.textContent = "Romaji Lyrics";
				lyrics.innerHTML = this.lyrics.romaji;
			} else {
				info.textContent = "English Lyrics";
				lyrics.innerHTML = this.lyrics.english;
			}
		} else {
			title.textContent = this.title;
			info.innerHTML = "No Lyrics :(";
		}
		
		addChildren(lyricsContainer, [title, info, lyrics, switchLyricsBtn]);
	}
}

function selectSection(button, section) {
	for (let button of s(".select-sec-btn", true)) {
		button.classList.remove("selected");
	}
	for (let section of s(".section", true)) {
		section.classList.remove("selected");
	}
	button.classList.toggle("selected");
	s(section).classList.toggle("selected");
}
function resizeSections() {
	let sscH = s("#select-sec-container").offsetHeight;
	let ctrlH = s("#controls").offsetHeight;
	
	for (let section of s(".section", true)) {
		if (window.matchMedia("(max-width: 576px").matches) {
			section.style.height = window.innerHeight - sscH - ctrlH + "px";
		} else {
			section.style.height = window.innerHeight - sscH + "px";
		}
	}
	
	s("#volume-panel").style.bottom = ctrlH - 5 + "px";
}

// load tracks of the given query
let urlParams = new URLSearchParams(window.location.search);
let param = urlParams.get("s");
let player = new Player();
switch (param) {
	case "discography":
		for (let t of data.discography) {
			let title = t.titles[0];
			let info = t.album === "Unknown" ? "Minami" : "Minami – " + t.album;
			let lyrics = t.lyrics;
			let src = t.links.src;
			let track = new Track(title, info, lyrics, src);
			player.tracks.push(track);
			player.origTracks.push(track);
		}
		break;
	case "covers":
		for (let t of data.covers) {
			let title = t.title;
			let info = t.artist;
			let lyrics = "none";
			let src = t.links.src;
			let track = new Track(title, info, lyrics, src);
			player.tracks.push(track);
			player.origTracks.push(track);
		}
		break;
	case "others":
		for (let t of data.others) {
			let title = t.title;
			let info = t.version.substring(1, t.version.length - 1);
			let lyrics = "none";
			let src = t.links.src;
			let track = new Track(title, info, lyrics, src);
			player.tracks.push(track);
			player.origTracks.push(track);
		}
		break;
	case "livestreams":
		for (let t of data.livestreams) {
			let l = `Lyrics not available.<br>Not playing? Download <a href="${t.links.src}" target="_blank">here</a>.`;
			
			let title = t.title;
			let info = new Date(t.date).toLocaleDateString("en-US", {
				weekday: "long", year: "numeric", month: "long", day: "numeric"
			});
			let lyrics = {"romaji": l, "english": l};
			let src = t.links.src;
			let track = new Track(title, info, lyrics, src);
			player.tracks.push(track);
			player.origTracks.push(track);
		}
		break;
	default:
		let tl = s("#tracklist");
		tl.style.padding = "20px 35px";
		tl.textContent = "Not available.";
}
player.render();

window.onload = resizeSections;
window.onresize = resizeSections;
