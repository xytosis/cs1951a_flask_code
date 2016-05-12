from flask import Flask, request, render_template
import json
import urllib
import urllib2
from datetime import datetime
from dateutil.relativedelta import relativedelta
from karma_predictor import model, vectorizer, top_words
import threading
import Queue
import os
import csv
from collections import defaultdict
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from oauth2client.client import GoogleCredentials
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk import tokenize
import re
from textstat.textstat import textstat
from nltk.tokenize import RegexpTokenizer
from stop_words import get_stop_words
from nltk.stem.porter import PorterStemmer
from gensim import corpora, models
import gensim
from collections import Counter
from nltk.corpus import stopwords

application = Flask(__name__)
SOLR_IP = "54.173.242.173:8983"
credentials = GoogleCredentials.get_application_default()
bigquery_pid = "project1-1258"
APP_ROOT = os.path.dirname(os.path.abspath(__file__))   # refers to application_top
APP_STATIC = os.path.join(APP_ROOT, 'static')
global subreddit_map
subreddit_map = {}

def init_subreddit_map():
	bigquery_service = build('bigquery', 'v2', credentials=credentials)

	query = '''
	SELECT subreddit FROM (SELECT subreddit, count(*) AS c1 
		FROM [fh-bigquery:reddit_comments.2016_01]
		GROUP BY subreddit 
		ORDER BY c1 DESC LIMIT 10000)
	'''
	try:
		query_request = bigquery_service.jobs()
		query_data = {
			'query': (query)
		}

		query_response = query_request.query(
			projectId="project1-1258",
			body=query_data).execute()

		for row in query_response['rows']:
			subreddit = row['f'][0]['v']
			subreddit_map[subreddit.lower()] = subreddit

	except HttpError as err:
		print('Error: {}'.format(err.content))
		raise err

init_subreddit_map()


def get_url(q, req, start):
	response = json.loads(urllib2.urlopen(req).read())
	q.append([start, response["response"]["numFound"]])

@application.route("/")
def hello():
	return render_template("start.html")

# queries solr and returns frequency to time slice (month)
@application.route("/freq_by_time", methods=["POST"])
def freq_by_time():
	text = urllib.quote(request.form["text"])
	ranges = []
	cur_date = datetime.strptime("2007-10-01T23:59:59Z", "%Y-%m-%dT%H:%M:%SZ")
	end_date = datetime.strptime("2016-04-01T23:59:59Z", "%Y-%m-%dT%H:%M:%SZ")
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
			start_to_stuff[q[0]] = [q[1]]

	for q in q2:
		if q[0] in start_to_stuff:
			start_to_stuff[q[0]].append(q[1])
		else:
			start_to_stuff[q[0]] = [q[1]]

	final_array = []
	for key in start_to_stuff.keys():
		final_array.append((key, start_to_stuff[key][0], start_to_stuff[key][1]))

	return json.dumps(sorted(final_array, key=lambda x: x[0]))


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

@application.route("/subreddit_popularity", methods=["POST"])
def subreddit_time_by_count_linechart():
	subreddit = urllib.quote(request.form["subreddit"])
	subreddit = subreddit_map[subreddit.lower()]
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
		req = "http://" + SOLR_IP + "/solr/comments/select?rows=0&wt=json&q=(created_utc:[" + start + "%20TO%20" + end + "]%20AND%20subreddit:" +subreddit + ")"
		req2 = "http://" + SOLR_IP + "/solr/comments/select?rows=0&wt=json&q=created_utc:[" + start + "%20TO%20" + end + "]"
		t = threading.Thread(target=get_url, args=(q1, req, start))
		t2 = threading.Thread(target=get_url, args=(q2, req2, start))
		threads.append(t)
		threads.append(t2)
		t.start()
		t2.start()

	for t in threads:
		t.join()

	start_to_stuff = defaultdict(lambda:list())

	for q in q2:
		start_to_stuff[q[0]].append(q[1])

	for q in q1:
		total = start_to_stuff[q[0]][0]
		start_to_stuff[q[0]].append(float(q[1])/total)

	final_array = []
	for key, value in start_to_stuff.iteritems():
		final_array.append([key[:10], 100*value[1]])

	return json.dumps(sorted(final_array, key = lambda i : i[0]))

@application.route("/sentiment", methods=["POST"])
def sentiment():
	phrase = urllib.quote(request.form["text"])
	subreddit = urllib.quote(request.form["subreddit"])
	subreddit = subreddit_map[subreddit.lower()]	
	sid = SentimentIntensityAnalyzer()
	start_year = 2008
	end_year = 2017
	year_diff = end_year - start_year
	results = [None] * year_diff
	threads = [None] * year_diff


	def getSentiment(year):
		year_str = str(year)
		if int(year) > 2014:
			year_str += "_01"

		query = '''SELECT body, score 
		FROM 
		(SELECT subreddit, body, score, RAND() AS r1
		FROM [fh-bigquery:reddit_comments.''' + str(year_str) + ''']
		WHERE subreddit == \"''' + subreddit + '''\"
		AND body != "[deleted]"
		AND body != "[removed]"
		AND REGEXP_MATCH(body, r'(?i:''' + phrase + ''')')
		AND score > 1
		ORDER BY r1
		LIMIT 1000)'''

		bigquery_service = build('bigquery', 'v2', credentials=credentials)
		try:
			query_request = bigquery_service.jobs()
			query_data = {
				'query': query,
				'timeoutMs': 30000
			}

			query_response = query_request.query(
				projectId=bigquery_pid,
				body=query_data).execute()

		except HttpError as err:
			print('Error: {}'.format(err.content))
			raise err

		if 'rows' in query_response:
			rows = query_response['rows']
			sentiments = []
			for row in rows:
				body = row['f'][0]['v']
				score = int(row['f'][1]['v'])
				sentiment_values = []

				lines_list = tokenize.sent_tokenize(body)
				for sentence in lines_list:
					if phrase.upper() in sentence.upper():#(regex.search(sentence)):            
						s = sid.polarity_scores(sentence)
						sentiment_values.append(s['compound'])
				
				comment_sentiment = float(sum(sentiment_values)) / len(sentiment_values)
				
				sentiments = sentiments + (score * [comment_sentiment])

			results[year - start_year] = [str(year), sum(sentiments) / len(sentiments)]

	for i in range(year_diff):
		t = threading.Thread(target=getSentiment, args=([i + start_year]))
		threads[i] = t
		t.start()

	for t in threads:
		t.join()

	results = [r for r in results if r != None]
	return json.dumps(results)


def getWordcount(year, subreddit):
	query = '''SELECT body, RAND() AS r1
	FROM [fh-bigquery:reddit_comments.''' + str(year) + ''']
	WHERE subreddit == \"''' + subreddit + '''\"
	AND body != "[deleted]"
	AND body != "[removed]"
	AND score > 1
	ORDER BY r1
	LIMIT 1000'''

	bigquery_service = build('bigquery', 'v2', credentials=credentials)
	try:
		query_request = bigquery_service.jobs()
		query_data = {
		'query': query,
		'timeoutMs': 30000
		}

		query_response = query_request.query(
			projectId=bigquery_pid,
			body=query_data).execute()

	except HttpError as err:
		print('Error: {}'.format(err.content))
		raise err

	rows = query_response['rows']
	count = Counter()

	for row in rows:
		body = row['f'][0]['v']
		content = re.sub('\s+', ' ', body)  # condense all whitespace
		content = re.sub('[^A-Za-z ]+', '', content)  # remove non-alpha chars
		words = content.lower().split()
		stops = set(get_stop_words('en'))
		stops.update(stopwords.words('english'))

		words = [word for word in words if word not in stopwords.words('english')]
		count.update(words)

	return count.most_common(50)

@application.route("/wordcount", methods=["POST"])
def wordcount():
	year = urllib.quote(request.form["year"])
	subreddit = urllib.quote(request.form["subreddit"])

	subreddit = subreddit_map[subreddit.lower()]
	stuff = getWordcount(year, subreddit)
	stuff = [{"text" : el[0], "size": el[1]} for el in stuff]
	return json.dumps(stuff)

@application.route("/reading_level", methods=["POST"])
def reading_level():
	num_subreddits = 5
	year = urllib.quote(request.form["year"])
	if int(year) > 2014:
		year += "_01"
	results = [None] * num_subreddits
	threads = [None] * num_subreddits

	query1 = '''SELECT subreddit FROM 
	(SELECT subreddit, count(*) AS c1 
	FROM [fh-bigquery:reddit_comments.''' + str(year) + '''] 
	GROUP BY subreddit 
	ORDER BY c1 DESC LIMIT ''' + str(num_subreddits) + ''')'''

	bigquery_service1 = build('bigquery', 'v2', credentials=credentials)
	try:
		query_request1 = bigquery_service1.jobs()
		query_data1 = {
			'query': query1,
			'timeoutMs': 30000
		}

		query_response1 = query_request1.query(
			projectId=bigquery_pid,
			body=query_data1).execute()

	except HttpError as err:
		print('Error: {}'.format(err.content))
		raise err

	subreddits = [row['f'][0]['v'] for row in query_response1['rows']]

	def getReadingLevel(subreddit):
		query = '''SELECT body FROM 
		(SELECT body, RAND() AS r1
		FROM [fh-bigquery:reddit_comments.''' + str(year) + ''']
		WHERE subreddit == "''' + subreddit + '''"  
		AND body != "[deleted]"
		AND body != "[removed]"
		AND score > 1
		ORDER BY r1
		LIMIT 1000)
		'''

		bigquery_service = build('bigquery', 'v2', credentials=credentials)
		try:
			query_request = bigquery_service.jobs()
			query_data = {
				'query': query,
				'timeoutMs': 20000
			}

			query_response = query_request.query(
				projectId=bigquery_pid,
				body=query_data).execute()

		except HttpError as err:
			print('Error: {}'.format(err.content))
			raise err

		rows = query_response['rows']

		levels_sum = 0.0
		levels_count = 0
		for i in range(len(rows)):
			text = rows[i]['f'][0]['v']
			text = re.sub('([A-Za-z]+:\/\/[A-Za-z0-9]+\.[A-Za-z0-9]+[^\s-]*)|([A-Za-z]+\.[A-Za-z0-9]+\.[A-Za-z0-9]+[^\s-]*)', '', text) #url get rid
			text = re.sub('\s\s+', ' ', text)
			if textstat.sentence_count(text) > 0:
				levels_sum += textstat.flesch_reading_ease(text)
				levels_count += 1

		average_level = 0.0
		if levels_count > 0:
			average_level = levels_sum / levels_count
			results[subreddits.index(subreddit)] = [subreddit, 100.0 - average_level]

	for i in range(num_subreddits):
		t = threading.Thread(target=getReadingLevel, args=([subreddits[i]]))
		threads[i] = t
		t.start()

	for t in threads:
		t.join()

	return json.dumps(results)


@application.route("/topic_modeling", methods=["POST"])
def topic_modeling():
	subreddit = urllib.quote(request.form["subreddit"])
	subreddit = subreddit_map[subreddit.lower()]
	year = urllib.quote(request.form["year"])
	if int(year) > 2014:
		year += "_01"

	tokenizer = RegexpTokenizer(r'(?=\S[a-zA-Z\'-]+)([a-zA-Z\'-]+)')

	# create English stop words list
	en_stop = get_stop_words('en')

	# Create p_stemmer of class PorterStemmer
	p_stemmer = PorterStemmer()

	topic_num = 5
	# list for tokenized documents in loop
	texts = []

	query = '''SELECT body FROM 
		(SELECT body, RAND() AS r1
		FROM [fh-bigquery:reddit_comments.''' + str(year) + ''']
		WHERE subreddit == "''' + subreddit + '''"  
		AND body != "[deleted]"
		AND body != "[removed]"
		AND score > 1
		ORDER BY r1
		LIMIT 1000)
		'''

	bigquery_service = build('bigquery', 'v2', credentials=credentials)
	try:
		query_request = bigquery_service.jobs()
		query_data = {
			'query': query,
			'timeoutMs': 20000
		}

		query_response = query_request.query(
			projectId=bigquery_pid,
			body=query_data).execute()

	except HttpError as err:
		print('Error: {}'.format(err.content))
		raise err

	topics = []
	
	if 'rows' in query_response:
		rows = query_response['rows']
		for r in rows:   
		    # clean and tokenize document string
		    i = r['f'][0]['v']
		    raw = i.lower()
		    raw = re.sub('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', raw)
		    raw = re.sub("^\d+\s|\s\d+\s|\s\d+$", " ", raw)
		    raw = re.sub("&nbsp;|&lt;|&gt;|&amp;|&cent;|&pound;|&yen;|&euro;|&copy;|&reg;", " ", raw)
		    tokens = tokenizer.tokenize(raw)

		    # remove stop words from tokens
		    stopped_tokens = [i for i in tokens if not i in en_stop]
		    
		    # stem tokens
		    # stemmed_tokens = [p_stemmer.stem(i) for i in stopped_tokens]
		    
		    # add tokens to list
		    texts.append(stopped_tokens)

			# turn our tokenized documents into a id <-> term dictionary
		dictionary = corpora.Dictionary(texts)
		    
		# convert tokenized documents into a document-term matrix
		corpus = [dictionary.doc2bow(text) for text in texts]

		# generate LDA model
		ldamodel = gensim.models.ldamodel.LdaModel(corpus, num_topics=topic_num, id2word = dictionary, passes=1)
		# print(ldamodel[0])
		for topic in ldamodel.show_topics(num_topics=5, num_words=5):
		    line = topic[1].decode('utf-8')
		    splitted = line.split(' + ')
		    topic = []
		    for s in splitted:
		        topic.append(s.split('*')[1])
		    topics.append(topic)

	return json.dumps(topics)

if __name__ == "__main__":
	application.debug = True
	application.run(host='0.0.0.0')
