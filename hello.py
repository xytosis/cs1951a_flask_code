from flask import Flask, render_template, json

# Initialize the Flask application
application = Flask(__name__)

@application.route('/')
def index():
	return render_template('d3example.html')
# def index():
#     obj = [[1,2,3],123,123.123,'abc',{'key1':(1,2,3),'key2':(4,5,6)}]
    
#     # Convert python object to json
#     json_string = json.dumps(obj)
#     print 'Json: %s' % json_string

#     # Convert json to python object
#     new_obj = json.loads(json_string)
#     print 'Python obj: ', new_obj

#     # Render template
#     return render_template('index.html', json = json_string, obj = new_obj)

@application.route('/test')
def test():
	return render_template('test.html')

@application.route('/hello')
def hello():
	return "hello"

# Run
if __name__ == '__main__':
    application.run(host="0.0.0.0")
