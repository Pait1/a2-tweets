function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//written only
	written_tweets = runkeeper_tweets.map(t => new Tweet(t.text, t.created_at)).filter(t => t.written);
}

var written_tweets = [];

function addEventHandlerForSearch() {
	document.getElementById('textFilter').addEventListener('input', function (e) {
		//filter, case-insensitive; empty -> clear
		const q = e.target.value;
		const hits = q === '' ? [] : written_tweets.filter(t => t.writtenText.toLowerCase().includes(q.toLowerCase()));
		document.getElementById('searchCount').innerText = hits.length;
		document.getElementById('searchText').innerText = q;
		document.getElementById('tweetTable').innerHTML = hits.map((t, i) => t.getHTMLTableRow(i + 1)).join('');
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});