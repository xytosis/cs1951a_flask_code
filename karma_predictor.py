from sklearn.feature_extraction.text import CountVectorizer
import csv
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2
from sklearn.linear_model import Ridge
import pickle

def zero_one(x):
	if x == 0:
		return 0
	else:
		return 1


training_text = []
training_score = []
with open("training.csv", "rb") as training_file:
	reader = csv.reader(training_file)
	reader.next()
	for line in reader:
		training_text.append(line[0])
		training_score.append(int(line[1]))


vectorizer = CountVectorizer(lowercase=True, stop_words="english")
matrix = vectorizer.fit_transform(training_text)


col = map(lambda x: zero_one(x), training_score)

selector = SelectKBest(chi2, k=1000)
selector.fit(matrix, col)
top_words = selector.get_support().nonzero()
chi_matrix = matrix[:,top_words[0]]


reg = Ridge(alpha=.1)
model = reg.fit(chi_matrix, training_score)