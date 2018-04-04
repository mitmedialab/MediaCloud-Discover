from flask import render_template
from flask import Flask
from flask_cache import Cache
from flask import jsonify
from os import environ
import logging
import datetime
import mediacloud
import json
import os
import copy
import random
import numpy as np

mc = None
mc_admin = None
data = {}
app = Flask(__name__)
api_key = environ.get('MC_API_KEY')
logging.basicConfig(level=logging.DEBUG)


# Flask-Cache - filesystem

# Uses the filesystem to store cached values

#     CACHE_DEFAULT_TIMEOUT
#     CACHE_DIR
#     CACHE_THRESHOLD
#     CACHE_ARGS
#     CACHE_OPTIONS

# https://pythonhosted.org/Flask-Cache/
cache = Cache(app, config={'CACHE_TYPE': 'filesystem', 'CACHE_DIR': './cache', 'CACHE_DEFAULT_TIMEOUT': '28800'}) # 8 hour cache

COUNTRY_GEONAMES_ID_TO_APLHA3 = {3041565:"AND",290557:"ARE",1149361:"AFG",3576396:"ATG",3573511:"AIA",783754:"ALB",174982:"ARM",3351879:"AGO",6697173:"ATA",3865483:"ARG",5880801:"ASM",2782113:"AUT",2077456:"AUS",3577279:"ABW",661882:"ALA",587116:"AZE",3277605:"BIH",3374084:"BRB",1210997:"BGD",2802361:"BEL",2361809:"BFA",732800:"BGR",290291:"BHR",433561:"BDI",2395170:"BEN",3578476:"BLM",3573345:"BMU",1820814:"BRN",3923057:"BOL",7626844:"BES",3469034:"BRA",3572887:"BHS",1252634:"BTN",3371123:"BVT",933860:"BWA",630336:"BLR",3582678:"BLZ",6251999:"CAN",1547376:"CCK",203312:"COD",239880:"CAF",2260494:"COG",2658434:"CHE",2287781:"CIV",1899402:"COK",3895114:"CHL",2233387:"CMR",1814991:"CHN",3686110:"COL",3624060:"CRI",3562981:"CUB",3374766:"CPV",7626836:"CUW",2078138:"CXR",146669:"CYP",3077311:"CZE",2921044:"DEU",223816:"DJI",2623032:"DNK",3575830:"DMA",3508796:"DOM",2589581:"DZA",3658394:"ECU",453733:"EST",357994:"EGY",2461445:"ESH",338010:"ERI",2510769:"ESP",337996:"ETH",660013:"FIN",2205218:"FJI",3474414:"FLK",2081918:"FSM",2622320:"FRO",3017382:"FRA",2400553:"GAB",2635167:"GBR",3580239:"GRD",614540:"GEO",3381670:"GUF",3042362:"GGY",2300660:"GHA",2411586:"GIB",3425505:"GRL",2413451:"GMB",2420477:"GIN",3579143:"GLP",2309096:"GNQ",390903:"GRC",3474415:"SGS",3595528:"GTM",4043988:"GUM",2372248:"GNB",3378535:"GUY",1819730:"HKG",1547314:"HMD",3608932:"HND",3202326:"HRV",3723988:"HTI",719819:"HUN",1643084:"IDN",2963597:"IRL",294640:"ISR",3042225:"IMN",1269750:"IND",1282588:"IOT",99237:"IRQ",130758:"IRN",2629691:"ISL",3175395:"ITA",3042142:"JEY",3489940:"JAM",248816:"JOR",1861060:"JPN",192950:"KEN",1527747:"KGZ",1831722:"KHM",4030945:"KIR",921929:"COM",3575174:"KNA",1873107:"PRK",1835841:"KOR",831053:"XKX",285570:"KWT",3580718:"CYM",1522867:"KAZ",1655842:"LAO",272103:"LBN",3576468:"LCA",3042058:"LIE",1227603:"LKA",2275384:"LBR",932692:"LSO",597427:"LTU",2960313:"LUX",458258:"LVA",2215636:"LBY",2542007:"MAR",2993457:"MCO",617790:"MDA",3194884:"MNE",3578421:"MAF",1062947:"MDG",2080185:"MHL",718075:"MKD",2453866:"MLI",1327865:"MMR",2029969:"MNG",1821275:"MAC",4041468:"MNP",3570311:"MTQ",2378080:"MRT",3578097:"MSR",2562770:"MLT",934292:"MUS",1282028:"MDV",927384:"MWI",3996063:"MEX",1733045:"MYS",1036973:"MOZ",3355338:"NAM",2139685:"NCL",2440476:"NER",2155115:"NFK",2328926:"NGA",3617476:"NIC",2750405:"NLD",3144096:"NOR",1282988:"NPL",2110425:"NRU",4036232:"NIU",2186224:"NZL",286963:"OMN",3703430:"PAN",3932488:"PER",4030656:"PYF",2088628:"PNG",1694008:"PHL",1168579:"PAK",798544:"POL",3424932:"SPM",4030699:"PCN",4566966:"PRI",6254930:"PSE",2264397:"PRT",1559582:"PLW",3437598:"PRY",289688:"QAT",935317:"REU",798549:"ROU",6290252:"SRB",2017370:"RUS",49518:"RWA",102358:"SAU",2103350:"SLB",241170:"SYC",366755:"SDN",7909807:"SSD",2661886:"SWE",1880251:"SGP",3370751:"SHN",3190538:"SVN",607072:"SJM",3057568:"SVK",2403846:"SLE",3168068:"SMR",2245662:"SEN",51537:"SOM",3382998:"SUR",2410758:"STP",3585968:"SLV",7609695:"SXM",163843:"SYR",934841:"SWZ",3576916:"TCA",2434508:"TCD",1546748:"ATF",2363686:"TGO",1605651:"THA",1220409:"TJK",4031074:"TKL",1966436:"TLS",1218197:"TKM",2464461:"TUN",4032283:"TON",298795:"TUR",3573591:"TTO",2110297:"TUV",1668284:"TWN",149590:"TZA",690791:"UKR",226074:"UGA",5854968:"UMI",6252001:"USA",3439705:"URY",1512440:"UZB",3164670:"VAT",3577815:"VCT",3625428:"VEN",3577718:"VGB",4796775:"VIR",1562822:"VNM",2134431:"VUT",4034749:"WLF",4034894:"WSM",69543:"YEM",1024031:"MYT",953987:"ZAF",895949:"ZMB",878675:"ZWE"}

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
# //  Application Root
# //  Default to United States context
# /////////////////////////////////////////////////////////////////////////
@app.route('/')
def root():
  return render_template('index.html', data='9139487')


# /////////////////////////////////////////////////////////////////////////
@app.route('/word_over_time/<entity>')
def recent_sentence_counts( entity ):
  '''
  Helper to fetch sentences counts over the last year for an arbitrary query
  '''
  last_n_days = 30
  start_date = datetime.date.today()-datetime.timedelta(last_n_days)
  end_date = datetime.date.today()-datetime.timedelta(1)  # yesterday

  fq = mc.publish_date_query(start_date, end_date)

  start_datetime = datetime.datetime.strftime(start_date, '%Y-%m-%d')
  end_datetime = datetime.datetime.strftime(end_date, '%Y-%m-%d')

  sentences_over_time = mc.sentenceCount(word, solr_filter=fq, split=True,
    split_start_date=start_datetime,
    split_end_date=end_datetime)['split']

  return jsonify(sentences_over_time)


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


# /////////////////////////////////////////////////////////////////////////
@cache.cached(timeout=28800, key_prefix='cache_data')
def cache_data():
  return data


# /////////////////////////////////////////////////////////////////////////
@app.route('/clear_cache')
def clear_cache():
  with app.app_context():
    cache.clear()
  currentDT = datetime.datetime.now()
  return "Cache Cleared at {0}...".format(str(currentDT))


# /////////////////////////////////////////////////////////////////////////
@app.route('/show_cache')
def show_cache():
  response = build_json_response(data)
  return response


# /////////////////////////////////////////////////////////////////////////
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
  random_orgs = [addType(entity, 'organization') for entity in random_orgs]

  random.shuffle(c[country_id]['places'])
  random_places = c[country_id]['places'][:10]
  random_places = [addType(entity, 'location') for entity in random_places]

  all_entities = random_labels + random_places + random_orgs + random_people

  # Need parameter for size of sample from each entity type (and default = [:10])
  # Return all_entities

  response = build_json_response(all_entities)
  return response


# /////////////////////////////////////////////////////////////////////////
@app.route('/word_count/<term>')
def word_count(term):
  ngram_size = 1
  num_words = 20
  sample_size = 2000

  result = mc_admin.wordCount('*', term, ngram_size=ngram_size, num_words=num_words, sample_size=sample_size)
  return jsonify(result)


# /////////////////////////////////////////////////////////////////////////
@app.route('/popular_tags/<int:collection_id>')
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
@app.route('/getTopWords/<int:collection_id>')
def getTopWords(collection_id):
  word = mc_admin.wordCount('*', [
    'tags_id_media:{0}'.format(collection_id),
    'publish_date:NOW to NOW-3MONTH'
    ],
    num_words=100,
    sample_size=5000)

  return jsonify(word)


# /////////////////////////////////////////////////////////////////////////
@app.route('/getBiggestMedia/<int:collection_id>')  
def getBiggestMedia(collection_id):
  media = mc_admin.mediaList(rows=10, tags_id=collection_id, sort='num_stories')

  return jsonify(media)

    # "name": "Daily Mail", 
    # "num_sentences_90": 42936.69, 
    # "num_stories_90": 1795.62, 
    # "public_notes": "", 
    # "url": "http://www.dailymail.co.uk/home/index.html"
    # "media_id": 1747, 

# 1. pull list and filter for state data (only countries)
# /////////////////////////////////////////////////////////////////////////
@app.route('/getCountryGeoData/<int:collection_id>')
def getCountryGeoData(collection_id):
  geo_tags = mc_admin.sentenceFieldCount('tags_id_media:{0}'.format(collection_id), tag_sets_id=1011)
  country_tags = [t for t in geo_tags if int(t['tag'].split('_')[1]) in COUNTRY_GEONAMES_ID_TO_APLHA3.keys()]
  for t in country_tags:
    t['alpha3'] = COUNTRY_GEONAMES_ID_TO_APLHA3[int(t['tag'].split('_')[1])]
  return jsonify(country_tags)


# /////////////////////////////////////////////////////////////////////////
@app.route('/projects/<path:name>')
def projects(name):
	print 'Name: {0}'.format(name)
	return render_template('/{0}'.format(name))


# /////////////////////////////////////////////////////////////////////////
@app.route('/discover/<int:country_id>')
def discover(country_id=9139487):
  return render_template('index.html', data=country_id)


# /////////////////////////////////////////////////////////////////////////
@app.route('/sentences/<int:collection_id>/<entity>')
def sentences(collection_id, entity):
  sample_size = 2000

  if(entity.isdigit()):
    sentenceList = mc_admin.sentenceList('*', [
      'tags_id_media:({0})'.format(str(collection_id)),
      'tags_id_stories:{0}'.format(entity),
      'publish_date:NOW to NOW-3MONTH'], 
      rows=sample_size, sort=mc.SORT_RANDOM)
  else:
    sentenceList = mc_admin.sentenceList(entity, [
      'tags_id_media:({0})'.format(str(collection_id)),
      'publish_date:NOW to NOW-3MONTH'], 
      rows=sample_size, sort=mc.SORT_RANDOM)
  
  return jsonify(sentenceList)


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