from flask import Flask, request, render_template
import json
import urllib
import urllib2
from datetime import datetime
from dateutil.relativedelta import relativedelta

application = Flask(__name__)

@application.route("/")
def hello():
    return render_template("start.html")

@application.route("/freq_by_time", methods=["POST"])
def freq_by_time():
    text = urllib.quote(request.form["text"])
    #response = json.loads(urllib2.urlopen("http://52.207.213.209:8983/solr/comments/select?q=body:\"" + text + "\"&rows=0&wt=json").read())
    #numFound = response["response"]["numFound"]
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
        response = json.loads(urllib2.urlopen("http://52.207.213.209:8983/solr/comments/select?q=body:\"" + text + "\"&rows=0&wt=json&fq=created_utc:[" + start + "%20TO%20" + end + "]").read())
        time_to_count.append([start, response["response"]["numFound"]])

    return json.dumps(time_to_count)

if __name__ == "__main__":
    application.debug = True
    application.run(host='0.0.0.0')
