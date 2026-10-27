class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //rules: prefix keywords
        const t = this.text;
        if (/^(Just completed|Just posted|Completed) /.test(t)) return 'completed_event';
        if (/^Watch my .* right now/.test(t)) return 'live_event';
        if (/^(Achieved a new personal|I just set a goal)/.test(t)) return 'achievement';
        return 'miscellaneous';
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        return this.writtenText.length > 0;
    }

    get writtenText():string {
        //strip link, hashtag
        const t = this.text.replace(/https?:\/\/\S+/g, '').replace(/#runkeeper/gi, '').trim();
        if (this.source == 'completed_event') {
            const m = t.match(/^(?:Just posted|Just completed|Completed) .*? - ([\s\S]*)$/);
            if (m) return m[1].trim();
            if (/with @Runkeeper\. Check it out!\s*$/i.test(t)) return "";
            return t;
        }
        if (this.source != 'miscellaneous') {
            //default RunKeeper phrasing only
            return /^(Watch my|Achieved a new|I just set a goal)/.test(t) && /@Runkeeper|personal|goal/i.test(t) ? "" : t;
        }
        return t;
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //type: after 'a', before 'with'/'in'/'-'
        const m = this.text.match(/^(?:Just completed|Just posted|Completed) an? (?:[\d.]+ ?(?:km|mi) )?(.+?)(?: in \d+:| with| -| @|\s*$)/);
        if (!m) return "unknown";
        return m[1].replace(/ workout$/, '').trim();
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        const m = this.text.match(/^(?:Just completed|Just posted|Completed) an? ([\d.]+) ?(km|mi)/);
        if (!m) return 0;
        //km -> mi
        const d = parseFloat(m[1]);
        return m[2] == 'km' ? d / 1.609 : d;
    }

    getHTMLTableRow(rowNumber:number):string {
        //links clickable
        const linked = this.text.replace(/(https?:\/\/\S+)/g, '<a href="$1" target="_blank">$1</a>');
        return `<tr><td>${rowNumber}</td><td>${this.activityType}</td><td>${linked}</td></tr>`;
    }
}
