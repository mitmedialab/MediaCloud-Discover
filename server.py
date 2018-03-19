from flask import render_template
from flask import Flask
from flask_cache import Cache
from flask import jsonify
import datetime
import mediacloud
import json
import os
import copy
import random

mc = None
mc_admin = None
data = {}
app = Flask(__name__)
api_key = 'c300df092175a8c3e2c3b5638a3bdbd80214be36581b498d85b1e6d14146748f'


# Flask-Cache - filesystem

# Uses the filesystem to store cached values

#     CACHE_DEFAULT_TIMEOUT
#     CACHE_DIR
#     CACHE_THRESHOLD
#     CACHE_ARGS
#     CACHE_OPTIONS

# https://pythonhosted.org/Flask-Cache/
cache = Cache(app, config={'CACHE_TYPE': 'filesystem', 'CACHE_DIR': './cache', 'CACHE_DEFAULT_TIMEOUT': '7200'})


# /////////////////////////////////////////////////////////////////////////
def init():
   global mc
   global mc_admin
   global data
   
   mc = mediacloud.api.MediaCloud(api_key)
   mc_admin = mediacloud.api.AdminMediaCloud(api_key)
   print('Media Cloud Interface:')
   print(api_key)
   print(mc)
   print('Media Cloud Admin Interface:')
   print(mc_admin)


# /////////////////////////////////////////////////////////////////////////
def addType(entity, type):
  entity['type'] = type
  return entity


# /////////////////////////////////////////////////////////////////////////
def build_json_response(json_data):
  response = app.response_class( response=json.dumps(json_data), status=200, mimetype='application/json')
  return response

# /////////////////////////////////////////////////////////////////////////
@app.route('/cache_data')
def cache_data():

  # Tag sets that hold tags on stories...
  NYT_LABELS_TAG_SET = 1963               # one tag per theme in a story (Jasmin's transfer-learning model)
  GEO_TAG_SET = 1011                      # one tag per country/state stories are about (disambiguated)
  CLIFF_ORGS_TAG_SET = 2388               # one tag for each org mentioned in stories
  CLIFF_PEOPLE_TAG_SET = 2389             # one tag for each perosn mentioned in stories

  countries = { '9319462': 'Denmark', '9139487': 'USA' }

  for country_id, country_name in countries.items():
    data[country_id] = { 'name': country_name }

    print('Getting NYT Labels for {0}...'.format(country_name))
    data[country_id]['labels'] = getEntities(country_id, NYT_LABELS_TAG_SET)

    print('Getting Places for {0}...'.format(country_name))
    data[country_id]['places'] = getEntities(country_id, GEO_TAG_SET)

    print('Getting Organizations for {0}...'.format(country_name))
    data[country_id]['orgs']   = getEntities(country_id, CLIFF_ORGS_TAG_SET)

    print('Getting People for {0}...'.format(country_name))
    data[country_id]['people'] = getEntities(country_id, CLIFF_PEOPLE_TAG_SET)

    data[country_id]['media'] = []

  response = build_json_response(data)
  clear_cache()
  cache_data()
  return response

@cache.cached(timeout=7200, key_prefix='cache_data')
def cache_data():
  return data

@app.route('/clear_cache')
def clear_cache():
  with app.app_context():
    cache.clear()
  currentDT = datetime.datetime.now()
  return "Cache Cleared at {0}...".format(str(currentDT))

@app.route('/show_cache')
def show_cache():
  response = build_json_response(data)
  return response

@app.route('/country_entities/<country_id>')
def country_entities(country_id):
  c = cache_data()
  country_data = c[country_id]


# Pick 10 random elements
  random.shuffle(c[country_id]['people'])
  random_people = c[country_id]['people'][:10]
  random_people = [addType(entity, 'person') for entity in random_people]

  random.shuffle(c[country_id]['labels'])
  random_labels = c[country_id]['labels'][:10]
  random_labels = [addType(entity, 'label') for entity in random_labels]
  
  random.shuffle(c[country_id]['orgs'])
  random_orgs = c[country_id]['orgs'][:10]
  random_orgs = [addType(entity, 'org') for entity in random_orgs]

  random.shuffle(c[country_id]['places'])
  random_places = c[country_id]['places'][:10]
  random_places = [addType(entity, 'place') for entity in random_places]

  all_entities = random_labels + random_places + random_orgs + random_people

  # Need parameter for size of sample from each entity type (and default = [:10])
  # Return all_entities

  response = build_json_response(all_entities)
  return response


# /////////////////////////////////////////////////////////////////////////
@app.route('/popular_tags/<int:collection_id>')
# @cache.cached(timeout=3600)
def popular_tags(collection_id):

  # US Collection Entities: http://localhost:5000/popular_tags/9139487
  # US_PEW_TOP_MEDIA_COLLECTION_ID = 9139487
  
  # Tag sets that hold tags on stories...
  NYT_LABELS_TAG_SET = 1963               # one tag per theme in a story (Jasmin's transfer-learning model)
  GEO_TAG_SET = 1011                      # one tag per country/state stories are about (disambiguated)
  CLIFF_ORGS_TAG_SET = 2388               # one tag for each org mentioned in stories
  CLIFF_PEOPLE_TAG_SET = 2389             # one tag for each perosn mentioned in stories

  # TODO: Get Media Sources In Addition To The Above


  # Find the most use tags within a set over the last few months in the US Top Online set of sources
  print('Getting NYT Labels...')
  labels = getEntities(collection_id, NYT_LABELS_TAG_SET)
  
  print('Getting Places...')
  places = getEntities(collection_id, GEO_TAG_SET)
  
  print('Getting Organizations...')
  orgs   = getEntities(collection_id, CLIFF_ORGS_TAG_SET)
  
  print('Getting People...')
  people = getEntities(collection_id, CLIFF_PEOPLE_TAG_SET)

  # Counts of each entity being returned:
  # People Count: 1861
  # Label Count: 83
  # Orgs Count: 859
  # Places Count: 272

  # Pick a percentage:
  # newList = originalList[ : int(len(originalList) * .95)]

  # Pick 10 random elements
  random.shuffle(people)
  random_people = people[:15]
  random_people = [addType(entity, 'person') for entity in random_people]

  random.shuffle(labels)
  random_labels = labels[:15]
  random_labels = [addType(entity, 'label') for entity in random_labels]
  
  random.shuffle(orgs)
  random_orgs = orgs[:15]
  random_orgs = [addType(entity, 'org') for entity in random_orgs]

  random.shuffle(places)
  random_places = places[:15]
  random_places = [addType(entity, 'place') for entity in random_places]

  all_entities = random_labels + random_places + random_orgs + random_people
  print(json.dumps(all_entities))
  return render_template('popular_tags.html', data=all_entities)


# /////////////////////////////////////////////////////////////////////////
def getEntities(collection_id, tag_set):

  entities = mc_admin.sentenceFieldCount('*',[
      'tags_id_media:{}'.format(collection_id),
      'publish_date:NOW to NOW-3MONTH'
      ],
      tag_sets_id=tag_set,
      sample_size=5000)

  return entities


# /////////////////////////////////////////////////////////////////////////
@app.route('/projects/<path:name>')
def projects(name):
	print 'Name: {0}'.format(name)
	return render_template('/{0}'.format(name))


# /////////////////////////////////////////////////////////////////////////
@app.route('/discover/<int:topic_id>')
def discover(topic_id):
  top_media = mc.topicMediaList(topic_id)
  print json.dumps(top_media)
  return render_template('index.html', data=top_media)


# /////////////////////////////////////////////////////////////////////////
@app.route('/sentences/<int:tag_sets_id>')
def sentences(tag_sets_id):
  sample_size = 2000
  sentenceList = mc_admin.sentenceList('*', 'tags_id_media:' + str(tag_sets_id), rows=sample_size, sort=mc.SORT_RANDOM)
  response = build_json_response(sentenceList)
  return response


# /////////////////////////////////////////////////////////////////////////
@app.route('/topic_media/<int:topic_id>')
def topic_media(topic_id):
	# print('Calling for data...')

	# top_media = mc.mediaList(timespans_id=1467)
	# json.dumps(top_media)
	
  # top_media = mc.topicMediaList(topic_id)
  # return render_template('index.html', data=top_media)

  # In the absence of a stable connection to the MediaCloud server, run without data:
  fake_data = {'media': [{'name': 'SF Chronicle'}, {'name': 'The Guardian'}, {'name': 'CNN'}]}
  # fake_data['media'].append({'name': 'Fake News 1'})
  # fake_data['media'].append({'name': 'Fake News 2'})
  return render_template('index.html', data=fake_data)


# /////////////////////////////////////////////////////////////////////////
if __name__ == '__main__':
    init()
    app.run(debug=True, port=5000)