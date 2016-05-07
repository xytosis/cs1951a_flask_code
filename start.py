from flask import Flask, request, render_template
import json
import urllib
import urllib2
from datetime import datetime
from dateutil.relativedelta import relativedelta
from karma_predictor import model, vectorizer, top_words
import threading
import Queue

application = Flask(__name__)
SOLR_IP = "54.173.242.173:8983"

def get_url(q, req, start):
    response = json.loads(urllib2.urlopen(req).read())
    q.put([start, response["response"]["numFound"]])

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
    threads = []
    q1 = []
    q2 = []
    for r in ranges:
        start = r[0].strftime("%Y-%m-%dT%H:%M:%SZ")
        end = r[1].strftime("%Y-%m-%dT%H:%M:%SZ")
        req = "http://" + SOLR_IP + "/solr/comments/select?q=body:\"" + text + "\"&rows=0&wt=json&fq=created_utc:[" + start + "%20TO%20" + end + "]"
        req2 = "http://" + SOLR_IP + "/solr/comments/select?rows=0&wt=json&q=created_utc:[" + start + "%20TO%20" + end + "]"
        t = threading.Thread(target=get_url, args=(q1, req, start))
        t2 = threading.Thread(target=get_url, args=(q2, req2, start))
        threads.append(t)
        threads.append(t2)
        t.start()
        t2.start()
        #time_to_count.append([start, response["response"]["numFound"], response2["response"]["numFound"]])

    for t in threads:
        t.join()

    start_to_stuff = dict()
    for q in q1:
        if q[0] in start_to_stuff:
            start_to_stuff[q[0]].append(q[1])
        else:
            start_to_stuff[q[0]] = q[1]

    print start_to_stuff
    return ""


# queries solr and returns frequency to subreddit
@application.route("/freq_by_subreddit", methods=["POST"])
def freq_by_subreddit():
	text = urllib.quote(request.form["text"])
	req = "http://" + SOLR_IP + "/solr/comments/select?q=body:\"" + text + "\"&rows=10000&wt=json&fl=subreddit"
	response = json.loads(urllib2.urlopen(req).read())
	subreddit_count = {}
	for r in response["response"]["docs"]:
		if r["subreddit"] in subreddit_count:
			subreddit_count[r["subreddit"]] += 1
		else:
			subreddit_count[r["subreddit"]] = 1

	top = sorted(subreddit_count.items(), key=lambda x: x[1], reverse=True)[:100]
	return json.dumps(top)


@application.route("/karma_stats", methods=["POST"])
def karma_stats():
	text = urllib.quote(request.form["text"])
	req = req = "http://" + SOLR_IP + "/solr/comments/select?q=body:\"" + text + "\"&rows=3000&wt=json&fl=votescore"
	response = json.loads(urllib2.urlopen(req).read())
	data = []
	for r in response["response"]["docs"]:
		data.append(int(r["votescore"]))
	stats = dict()
	hist = dict()
	data = sorted(data)
	stats["min"] = min(data)
	stats["max"] = max(data)
	stats["mean"] = sum(data)/float(len(data))
	stats["median"] = data[len(data)/2]
	stats["q1"] = data[len(data)/4]
	stats["q3"] = data[3 * len(data)/4]
	for d in data:
		if d in hist:
			hist[d] += 1
		else:
			hist[d] = 1
	stats["hist"] = hist.items()
	stuff = sorted(hist.keys())
	stats["a"] = stuff[len(stuff)/2]
	stats["b"] = stuff[len(stuff)/4]
	stats["c"] = stuff[3 * len(stuff)/4]
	stats["d"] = stuff[len(stuff)/3]
	stats["max_height"] = max(hist.values())
	return json.dumps(stats)


@application.route("/karma_predict", methods=["POST"])
def karma_predict():
	text = [request.form["text"]]
	mat = vectorizer.transform(text)
	reduced_mat = mat[:,top_words[0]]
	output = model.predict(reduced_mat)
	return str(output[0])


@application.route("/word_phrase_sentiment", methods=["POST"])
def word_phrase_sentiment():
	text = urllib.quote(request.form["text"])
	req = req = "http://" + SOLR_IP + "/solr/comments/select?q=body:\"" + text + "\"&rows=3000&wt=json&fl=subreddit,body"
	response = json.loads(urllib2.urlopen(req).read())
	subreddit_count = dict()
	subreddit_sentiment = dict()
	for r in response["response"]["docs"]:
		if r["subreddit"] in subreddit_count:
			subreddit_count[r["subreddit"]] += 1
			#subreddit_sentiment[r["subreddit"]] += sentiment of body
		else:
			subreddit_count[r["subreddit"]] = 1
			#subreddit_sentiment[r["subreddit"]] = sentimnet of body

	# top_subreddits = sorted(subreddit_count.items(), key=lambda x: x[1], reverse=True)[:10]
	# top_subreddits_avg = []
	# for sb in top_subreddits:
	# 	top_subreddits_avg.append((sb[0], subreddit_sentiment[sb[0]]/float(sb[1])))
	# return json.dumps(sorted(top_subreddits_avg, key=lambda x: x[1], reverse=True))
	return ""


@application.route("/word_phrase_karma_subreddit", methods=["POST"])
def word_phrase_karma_subreddit():
	text = urllib.quote(request.form["text"])
	req = req = "http://" + SOLR_IP + "/solr/comments/select?q=body:\"" + text + "\"&rows=3000&wt=json&fl=subreddit,votescore"
	response = json.loads(urllib2.urlopen(req).read())
	subreddit_count = dict()
	subreddit_sentiment = dict()
	for r in response["response"]["docs"]:
		if r["subreddit"] in subreddit_count:
			subreddit_count[r["subreddit"]] += 1
			subreddit_sentiment[r["subreddit"]] += int(r["votescore"])
		else:
			subreddit_count[r["subreddit"]] = 1
			subreddit_sentiment[r["subreddit"]] = int(r["votescore"])

	top_subreddits = sorted(subreddit_count.items(), key=lambda x: x[1], reverse=True)[:10]
	top_subreddits_avg = []
	for sb in top_subreddits:
		top_subreddits_avg.append((sb[0], subreddit_sentiment[sb[0]]/float(sb[1])))
	return json.dumps(sorted(top_subreddits_avg, key=lambda x: x[1], reverse=True))

if __name__ == "__main__":
    application.debug = True
    application.run(host='0.0.0.0')
