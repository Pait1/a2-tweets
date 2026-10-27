function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//counts per type
	const counts = {};
	tweet_array.forEach(t => {
		if (t.source == 'completed_event') counts[t.activityType] = (counts[t.activityType] || 0) + 1;
	});
	const typeData = Object.keys(counts).map(k => ({activity: k, count: counts[k]}));
	document.getElementById('numberActivities').innerText = typeData.length;
	const top = typeData.slice().sort((x, y) => y.count - x.count).slice(0, 3).map(d => d.activity);
	['firstMost', 'secondMost', 'thirdMost'].forEach((id, i) => document.getElementById(id).innerText = top[i]);

	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": typeData
	  },
	  "mark": "bar",
	  "encoding": {
	    "x": {"field": "activity", "type": "nominal", "sort": "-y", "title": "Activity type"},
	    "y": {"field": "count", "type": "quantitative", "title": "Tweets"}
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//distance by day, top 3
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const distData = tweet_array
		.filter(t => t.source == 'completed_event' && top.includes(t.activityType))
		.map(t => ({activity: t.activityType, day: days[t.time.getDay()], distance: t.distance}));
	//mean rows per day+activity
	const meanData = [];
	days.forEach(d => top.forEach(act => {
		const v = distData.filter(r => r.day == d && r.activity == act).map(r => r.distance);
		if (v.length) meanData.push({activity: act, day: d, distance: v.reduce((x, y) => x + y, 0) / v.length});
	}));

	//one chart, 2 named datasets streamed in/out on toggle
	const enc = {
		"x": {"field": "day", "type": "ordinal", "sort": days, "title": "Day of week"},
		"y": {"field": "distance", "type": "quantitative", "title": "Distance (mi)"},
		"color": {"field": "activity", "type": "nominal"},
		"tooltip": [{"field": "activity"}, {"field": "day"}, {"field": "distance", "format": ".2f"}]
	};
	const dist_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"width": 500, "height": 300,
		"datasets": {"raw": distData, "mean": []},
		"layer": [
			{"data": {"name": "raw"}, "mark": {"type": "point", "filled": true, "size": 20, "opacity": 0.5}, "encoding": enc},
			{"data": {"name": "mean"}, "mark": {"type": "line", "strokeWidth": 3}, "encoding": enc},
			{"data": {"name": "mean"}, "mark": {"type": "point", "filled": true, "size": 160}, "encoding": enc}
		]
	};
	document.getElementById('distanceVisAggregated').style.display = 'none';
	const btn = document.getElementById('aggregate');
	let showAgg = false;
	const swap = (view, name, rows) =>
		view.change(name, vega.changeset().remove(() => true).insert(rows.map(r => ({...r}))));
	vegaEmbed('#distanceVis', dist_spec, {actions:false}).then(res => {
		btn.addEventListener('click', () => {
			showAgg = !showAgg;
			swap(res.view, 'raw', showAgg ? [] : distData);
			swap(res.view, 'mean', showAgg ? meanData : []);
			res.view.run();
			btn.innerText = showAgg ? 'Show all activities' : 'Show means';
		});
	});

	//answers (from graphs)
	document.getElementById('longestActivityType').innerText = 'bike';
	document.getElementById('shortestActivityType').innerText = 'walk';
	document.getElementById('weekdayOrWeekendLonger').innerText = 'weekends';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});