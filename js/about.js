function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;

	//dates
	const times = tweet_array.map(t => t.time.getTime());
	const fmt = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
	document.getElementById('firstDate').innerText = new Date(Math.min(...times)).toLocaleDateString('en-US', fmt);
	document.getElementById('lastDate').innerText = new Date(Math.max(...times)).toLocaleDateString('en-US', fmt);

	//categories
	const pct = (n, d) => math.format(n / d * 100, {notation: 'fixed', precision: 2}) + '%';
	const setAll = (cls, v) => document.querySelectorAll('.' + cls).forEach(e => e.innerText = v);
	const total = tweet_array.length;
	const cats = {completedEvents: 'completed_event', liveEvents: 'live_event', achievements: 'achievement', miscellaneous: 'miscellaneous'};
	for (const cls in cats) {
		const n = tweet_array.filter(t => t.source == cats[cls]).length;
		setAll(cls, n);
		setAll(cls + 'Pct', pct(n, total));
	}

	//written
	const completed = tweet_array.filter(t => t.source == 'completed_event');
	const written = completed.filter(t => t.written).length;
	setAll('written', written);
	setAll('writtenPct', pct(written, completed.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});