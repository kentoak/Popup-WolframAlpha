(() => {
	'use strict';
	const URL_WOLFRAM_ALPHA = "https://ja.wolframalpha.com/input/?i=";
	const track = (query) => {
		return new Promise(resolve => {
			try {
				wal('log', 'event', 'chromeExtension', {
					referer: document.referrer,
					query
				});
				setTimeout(() => resolve(), 200);
			} catch (e) {
				console.warn(e);
			}
		});
	};

	const navigate = (query) => {
		const url = `${URL_WOLFRAM_ALPHA}${encodeURIComponent(query)}`;
		//ここ田岡
		chrome.windows.create({
			url: url,
			type: 'popup',
			top: 5,
            left: 0,
			width: Math.round(screen.availWidth/4), 
			height: Math.round(screen.availHeight/2),
			focused: true,
		});
		// window.open(url);
		// window.close();
		//ここ田岡
	};

	document.addEventListener('submit', async (e) => {
		e.preventDefault();
		const query = document.getElementById('query').value;
		if (query && query.trim() !== '') {
			await track(query);
			navigate(query);
		}
	});
})();

