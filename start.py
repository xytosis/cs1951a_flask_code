from flask import Flask, request, render_template
import json
import urllib
import urllib2
from datetime import datetime
from dateutil.relativedelta import relativedelta

application = Flask(__name__)
SOLR_IP = "54.173.242.173:8983"

@application.route("/")
def hello():
    return render_template("start.html")


# queries solr and returns frequency to time slice (month)
@application.route("/freq_by_time", methods=["POST"])
def freq_by_time():
    text = urllib.quote(request.form["text"])
    ranges = []
    cur_date = datetime.strptime("2007-10-01T23:59:59Z", "%Y-%m-%dT%H:%M:%SZ")
    end_date = datetime.strptime("2015-01-01T23:59:59Z", "%Y-%m-%dT%H:%M:%SZ")
    while cur_date < end_date:
        ranges.append((cur_date, cur_date + relativedelta(months=1)))
        cur_date = cur_date + relativedelta(months=1)
    time_to_count = []
    for r in ranges:
        start = r[0].strftime("%Y-%m-%dT%H:%M:%SZ")
        end = r[1].strftime("%Y-%m-%dT%H:%M:%SZ")
        req = "http://" + SOLR_IP + "/solr/comments/select?q=body:\"" + text + "\"&rows=0&wt=json&fq=created_utc:[" + start + "%20TO%20" + end + "]"
        req2 = "http://" + SOLR_IP + "/solr/comments/select?rows=0&wt=json&q=created_utc:[" + start + "%20TO%20" + end + "]"
        response = json.loads(urllib2.urlopen(req).read())
        response2 = json.loads(urllib2.urlopen(req2).read())
        time_to_count.append([start, response["response"]["numFound"], response2["response"]["numFound"]])

    return json.dumps(time_to_count)


# queries solr and returns frequency to subreddit
@application.route("/freq_by_subreddit", methods=["POST"])
def freq_by_subreddit():
	text = urllib.quote(request.form["text"])
	req = "http://" + SOLR_IP + "/solr/comments/select?q=body:\"" + text + "\"&rows=1000&wt=json"
	response = json.loads(urllib2.urlopen(req).read())
	subreddit_count = {}
	for r in response["response"]["docs"]:
		if r["subreddit"] in subreddit_count:
			subreddit_count[r["subreddit"]] += 1
		else:
			subreddit_count[r["subreddit"]] = 1

	top = sorted(subreddit_count.items(), key=lambda x: x[1], reverse=True)[:100]
	return json.dumps(top)


if __name__ == "__main__":
    application.debug = True
    application.run(host='0.0.0.0')
