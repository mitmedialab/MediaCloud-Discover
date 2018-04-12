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

COUNTRY_ALPHA_TO_LAT_LONG = {'DZA': {'lat': 28.0, 'long': 3.0}, 'AGO': {'lat': -12.5, 'long': 18.5}, 'EGY': {'lat': 27.0, 'long': 30.0}, 'BGD': {'lat': 24.0, 'long': 90.0}, 'NER': {'lat': 16.0, 'long': 8.0}, 'LIE': {'lat': 47.1667, 'long': 9.5333}, 'NAM': {'lat': -22.0, 'long': 17.0}, 'BGR': {'lat': 43.0, 'long': 25.0}, 'BOL': {'lat': -17.0, 'long': -65.0}, 'GHA': {'lat': 8.0, 'long': -2.0}, 'CCK': {'lat': -12.5, 'long': 96.8333}, 'PAK': {'lat': 30.0, 'long': 70.0}, 'CPV': {'lat': 16.0, 'long': -24.0}, 'JOR': {'lat': 31.0, 'long': 36.0}, 'LBR': {'lat': 6.5, 'long': -9.5}, 'LBY': {'lat': 25.0, 'long': 17.0}, 'MYS': {'lat': 2.5, 'long': 112.5}, 'DOM': {'lat': 19.0, 'long': -70.6667}, 'PRI': {'lat': 18.25, 'long': -66.5}, 'MYT': {'lat': -12.8333, 'long': 45.1667}, 'PRK': {'lat': 40.0, 'long': 127.0}, 'PSE': {'lat': 32.0, 'long': 35.25}, 'TZA': {'lat': -6.0, 'long': 35.0}, 'BWA': {'lat': -22.0, 'long': 24.0}, 'KHM': {'lat': 13.0, 'long': 105.0}, 'UMI': {'lat': 19.2833, 'long': 166.6}, 'TTO': {'lat': 11.0, 'long': -61.0}, 'PRY': {'lat': -23.0, 'long': -58.0}, 'HKG': {'lat': 22.25, 'long': 114.1667}, 'SAU': {'lat': 25.0, 'long': 45.0}, 'LBN': {'lat': 33.8333, 'long': 35.8333}, 'SVN': {'lat': 46.0, 'long': 15.0}, 'BFA': {'lat': 13.0, 'long': -2.0}, 'SVK': {'lat': 48.6667, 'long': 19.5}, 'MRT': {'lat': 20.0, 'long': -12.0}, 'HRV': {'lat': 45.1667, 'long': 15.5}, 'CHL': {'lat': -30.0, 'long': -71.0}, 'CHN': {'lat': 35.0, 'long': 105.0}, 'KNA': {'lat': 17.3333, 'long': -62.75}, 'JAM': {'lat': 18.25, 'long': -77.5}, 'SMR': {'lat': 43.7667, 'long': 12.4167}, 'GIB': {'lat': 36.1833, 'long': -5.3667}, 'DJI': {'lat': 11.5, 'long': 43.0}, 'GIN': {'lat': 11.0, 'long': -10.0}, 'FIN': {'lat': 64.0, 'long': 26.0}, 'URY': {'lat': -33.0, 'long': -56.0}, 'VAT': {'lat': 41.9, 'long': 12.45}, 'STP': {'lat': 1.0, 'long': 7.0}, 'SYC': {'lat': -4.5833, 'long': 55.6667}, 'NPL': {'lat': 28.0, 'long': 84.0}, 'CXR': {'lat': -10.5, 'long': 105.6667}, 'LAO': {'lat': 18.0, 'long': 105.0}, 'YEM': {'lat': 15.0, 'long': 48.0}, 'BVT': {'lat': -54.4333, 'long': 3.4}, 'ZAF': {'lat': -29.0, 'long': 24.0}, 'KIR': {'lat': 1.4167, 'long': 173.0}, 'PHL': {'lat': 13.0, 'long': 122.0}, 'ROU': {'lat': 46.0, 'long': 25.0}, 'VIR': {'lat': 18.3333, 'long': -64.8333}, 'SYR': {'lat': 35.0, 'long': 38.0}, 'MAC': {'lat': 22.1667, 'long': 113.55}, 'NIC': {'lat': 13.0, 'long': -85.0}, 'MLT': {'lat': 35.8333, 'long': 14.5833}, 'KAZ': {'lat': 48.0, 'long': 68.0}, 'TCA': {'lat': 21.75, 'long': -71.5833}, 'PYF': {'lat': -15.0, 'long': -140.0}, 'NIU': {'lat': -19.0333, 'long': -169.8667}, 'DMA': {'lat': 15.4167, 'long': -61.3333}, 'GBR': {'lat': 54.0, 'long': -2.0}, 'BEN': {'lat': 9.5, 'long': 2.25}, 'GUF': {'lat': 4.0, 'long': -53.0}, 'BEL': {'lat': 50.8333, 'long': 4.0}, 'MSR': {'lat': 16.75, 'long': -62.2}, 'TGO': {'lat': 8.0, 'long': 1.1667}, 'DEU': {'lat': 51.0, 'long': 9.0}, 'GUM': {'lat': 13.4667, 'long': 144.7833}, 'LKA': {'lat': 7.0, 'long': 81.0}, 'FLK': {'lat': -51.75, 'long': -59.0}, 'PCN': {'lat': -24.7, 'long': -127.4}, 'GUY': {'lat': 5.0, 'long': -59.0}, 'CRI': {'lat': 10.0, 'long': -84.0}, 'COK': {'lat': -21.2333, 'long': -159.7667}, 'MAR': {'lat': 32.0, 'long': -5.0}, 'MNP': {'lat': 15.2, 'long': 145.75}, 'LSO': {'lat': -29.5, 'long': 28.5}, 'HUN': {'lat': 47.0, 'long': 20.0}, 'TKM': {'lat': 40.0, 'long': 60.0}, 'SUR': {'lat': 4.0, 'long': -56.0}, 'NLD': {'lat': 52.5, 'long': 5.75}, 'BMU': {'lat': 32.3333, 'long': -64.75}, 'HMD': {'lat': -53.1, 'long': 72.5167}, 'TCD': {'lat': 15.0, 'long': 19.0}, 'GEO': {'lat': 42.0, 'long': 43.5}, 'MNE': {'lat': 42.0, 'long': 19.0}, 'MNG': {'lat': 46.0, 'long': 105.0}, 'MHL': {'lat': 9.0, 'long': 168.0}, 'MTQ': {'lat': 14.6667, 'long': -61.0}, 'BLZ': {'lat': 17.25, 'long': -88.75}, 'NFK': {'lat': -29.0333, 'long': 167.95}, 'MMR': {'lat': 22.0, 'long': 98.0}, 'AFG': {'lat': 33.0, 'long': 65.0}, 'BDI': {'lat': -3.5, 'long': 30.0}, 'VGB': {'lat': 18.5, 'long': -64.5}, 'BLR': {'lat': 53.0, 'long': 28.0}, 'GRD': {'lat': 12.1167, 'long': -61.6667}, 'TKL': {'lat': -9.0, 'long': -172.0}, 'GRC': {'lat': 39.0, 'long': 22.0}, 'GRL': {'lat': 72.0, 'long': -40.0}, 'SHN': {'lat': -15.9333, 'long': -5.7}, 'AND': {'lat': 42.5, 'long': 1.6}, 'MOZ': {'lat': -18.25, 'long': 35.0}, 'TJK': {'lat': 39.0, 'long': 71.0}, 'THA': {'lat': 15.0, 'long': 100.0}, 'HTI': {'lat': 19.0, 'long': -72.4167}, 'MEX': {'lat': 23.0, 'long': -102.0}, 'ANT': {'lat': 12.25, 'long': -68.75}, 'ZWE': {'lat': -20.0, 'long': 30.0}, 'LCA': {'lat': 13.8833, 'long': -61.1333}, 'IND': {'lat': 20.0, 'long': 77.0}, 'LVA': {'lat': 57.0, 'long': 25.0}, 'BTN': {'lat': 27.5, 'long': 90.5}, 'VCT': {'lat': 13.25, 'long': -61.2}, 'VNM': {'lat': 16.0, 'long': 106.0}, 'NOR': {'lat': 62.0, 'long': 10.0}, 'CZE': {'lat': 49.75, 'long': 15.5}, 'ATF': {'lat': -43.0, 'long': 67.0}, 'ATG': {'lat': 17.05, 'long': -61.8}, 'FJI': {'lat': -18.0, 'long': 175.0}, 'IOT': {'lat': -6.0, 'long': 71.5}, 'HND': {'lat': 15.0, 'long': -86.5}, 'MUS': {'lat': -20.2833, 'long': 57.55}, 'ATA': {'lat': -90.0, 'long': 0.0}, 'LUX': {'lat': 49.75, 'long': 6.1667}, 'ISR': {'lat': 31.5, 'long': 34.75}, 'FSM': {'lat': 6.9167, 'long': 158.25}, 'PER': {'lat': -10.0, 'long': -76.0}, 'REU': {'lat': -21.1, 'long': 55.6}, 'IDN': {'lat': -5.0, 'long': 120.0}, 'VUT': {'lat': -16.0, 'long': 167.0}, 'MKD': {'lat': 41.8333, 'long': 22.0}, 'COD': {'lat': 0.0, 'long': 25.0}, 'COG': {'lat': -1.0, 'long': 15.0}, 'ISL': {'lat': 65.0, 'long': -18.0}, 'GLP': {'lat': 16.25, 'long': -61.5833}, 'ETH': {'lat': 8.0, 'long': 38.0}, 'COM': {'lat': -12.1667, 'long': 44.25}, 'COL': {'lat': 4.0, 'long': -72.0}, 'NGA': {'lat': 10.0, 'long': 8.0}, 'TWN': {'lat': 23.5, 'long': 121.0}, 'PRT': {'lat': 39.5, 'long': -8.0}, 'MDA': {'lat': 47.0, 'long': 29.0}, 'GGY': {'lat': 49.5, 'long': -2.56}, 'MDG': {'lat': -20.0, 'long': 47.0}, 'ECU': {'lat': -2.0, 'long': -77.5}, 'SEN': {'lat': 14.0, 'long': -14.0}, 'ESH': {'lat': 24.5, 'long': -13.0}, 'MDV': {'lat': 3.25, 'long': 73.0}, 'ASM': {'lat': -14.3333, 'long': -170.0}, 'SPM': {'lat': 46.8333, 'long': -56.3333}, 'SRB': {'lat': 44.0, 'long': 21.0}, 'FRA': {'lat': 46.0, 'long': 2.0}, 'LTU': {'lat': 56.0, 'long': 24.0}, 'RWA': {'lat': -2.0, 'long': 30.0}, 'ZMB': {'lat': -15.0, 'long': 30.0}, 'GMB': {'lat': 13.4667, 'long': -16.5667}, 'WLF': {'lat': -13.3, 'long': -176.2}, 'JEY': {'lat': 49.21, 'long': -2.13}, 'FRO': {'lat': 62.0, 'long': -7.0}, 'GTM': {'lat': 15.5, 'long': -90.25}, 'DNK': {'lat': 56.0, 'long': 10.0}, 'IMN': {'lat': 54.23, 'long': -4.55}, 'AUS': {'lat': -27.0, 'long': 133.0}, 'AUT': {'lat': 47.3333, 'long': 13.3333}, 'SJM': {'lat': 78.0, 'long': 20.0}, 'VEN': {'lat': 8.0, 'long': -66.0}, 'PLW': {'lat': 7.5, 'long': 134.5}, 'KEN': {'lat': 1.0, 'long': 38.0}, 'TUR': {'lat': 39.0, 'long': 35.0}, 'ALB': {'lat': 41.0, 'long': 20.0}, 'OMN': {'lat': 21.0, 'long': 57.0}, 'TUV': {'lat': -8.0, 'long': 178.0}, 'ITA': {'lat': 42.8333, 'long': 12.8333}, 'BRN': {'lat': 4.5, 'long': 114.6667}, 'TUN': {'lat': 34.0, 'long': 9.0}, 'RUS': {'lat': 60.0, 'long': 100.0}, 'BRB': {'lat': 13.1667, 'long': -59.5333}, 'BRA': {'lat': -10.0, 'long': -55.0}, 'CIV': {'lat': 8.0, 'long': -5.0}, 'TLS': {'lat': -8.55, 'long': 125.5167}, 'GNQ': {'lat': 2.0, 'long': 10.0}, 'USA': {'lat': 38.0, 'long': -97.0}, 'QAT': {'lat': 25.5, 'long': 51.25}, 'WSM': {'lat': -13.5833, 'long': -172.3333}, 'AZE': {'lat': 40.5, 'long': 47.5}, 'GNB': {'lat': 12.0, 'long': -15.0}, 'SWZ': {'lat': -26.5, 'long': 31.5}, 'TON': {'lat': -20.0, 'long': -175.0}, 'CAN': {'lat': 60.0, 'long': -95.0}, 'UKR': {'lat': 49.0, 'long': 32.0}, 'KOR': {'lat': 37.0, 'long': 127.5}, 'AIA': {'lat': 18.25, 'long': -63.1667}, 'CAF': {'lat': 7.0, 'long': 21.0}, 'CHE': {'lat': 47.0, 'long': 8.0}, 'CYP': {'lat': 35.0, 'long': 33.0}, 'BIH': {'lat': 44.0, 'long': 18.0}, 'SGP': {'lat': 1.3667, 'long': 103.8}, 'SGS': {'lat': -54.5, 'long': -37.0}, 'SOM': {'lat': 10.0, 'long': 49.0}, 'UZB': {'lat': 41.0, 'long': 64.0}, 'CMR': {'lat': 6.0, 'long': 12.0}, 'POL': {'lat': 52.0, 'long': 20.0}, 'KWT': {'lat': 29.3375, 'long': 47.6581}, 'ERI': {'lat': 15.0, 'long': 39.0}, 'GAB': {'lat': -1.0, 'long': 11.75}, 'CYM': {'lat': 19.5, 'long': -80.5}, 'ARE': {'lat': 24.0, 'long': 54.0}, 'EST': {'lat': 59.0, 'long': 26.0}, 'MWI': {'lat': -13.5, 'long': 34.0}, 'ESP': {'lat': 40.0, 'long': -4.0}, 'IRQ': {'lat': 33.0, 'long': 44.0}, 'SLV': {'lat': 13.8333, 'long': -88.9167}, 'MLI': {'lat': 17.0, 'long': -4.0}, 'IRL': {'lat': 53.0, 'long': -8.0}, 'IRN': {'lat': 32.0, 'long': 53.0}, 'ABW': {'lat': 12.5, 'long': -69.9667}, 'SLE': {'lat': 8.5, 'long': -11.5}, 'PAN': {'lat': 9.0, 'long': -80.0}, 'SDN': {'lat': 15.0, 'long': 30.0}, 'SLB': {'lat': -8.0, 'long': 159.0}, 'NZL': {'lat': -41.0, 'long': 174.0}, 'MCO': {'lat': 43.7333, 'long': 7.4}, 'JPN': {'lat': 36.0, 'long': 138.0}, 'KGZ': {'lat': 41.0, 'long': 75.0}, 'UGA': {'lat': 1.0, 'long': 32.0}, 'NCL': {'lat': -21.5, 'long': 165.5}, 'PNG': {'lat': -6.0, 'long': 147.0}, 'ARG': {'lat': -34.0, 'long': -64.0}, 'SWE': {'lat': 62.0, 'long': 15.0}, 'BHS': {'lat': 24.25, 'long': -76.0}, 'BHR': {'lat': 26.0, 'long': 50.55}, 'ARM': {'lat': 40.0, 'long': 45.0}, 'NRU': {'lat': -0.5333, 'long': 166.9167}, 'CUB': {'lat': 21.5, 'long': -80.0}}

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
@app.route('/word_over_time/<int:collection_id>/<entity>')
def recent_sentence_counts( collection_id, entity ):
  '''
  Helper to fetch sentences counts over the last year for an arbitrary query
  '''
  last_n_days = 30
  start_date = datetime.date.today()-datetime.timedelta(last_n_days)
  end_date = datetime.date.today()-datetime.timedelta(1)  # yesterday

  fq = mc.publish_date_query(start_date, end_date)

  start_datetime = datetime.datetime.strftime(start_date, '%Y-%m-%d')
  end_datetime = datetime.datetime.strftime(end_date, '%Y-%m-%d')

  if(entity.isdigit()):
  
    sentences_over_time = mc.sentenceCount('*', 
      [
        'tags_id_media:({0})'.format(str(collection_id)),
        'tags_id_stories:{0}'.format(entity),
        fq
      ],
      split=True,
      split_start_date=start_datetime,
      split_end_date=end_datetime)['split']

  else:
    sentences_over_time = mc.sentenceCount(entity, 
      [
        'tags_id_media:({0})'.format(str(collection_id)),
        fq
      ],
      split=True,
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

  # countries = { '9319462': 'Denmark', '9139487': 'USA', '38376339': 'Afghanistan', '34412056': 'Japan', '34412193': 'China', '34412118': 'India' }
  countries = { '9319462': 'Denmark', '34412193': 'China', '34412118': 'India' }

  for country_id, country_name in countries.items():
    data[country_id] = { 'name': country_name }

    print('Getting Media for {0}...'.format(country_name))
    data[country_id]['media'] = getBiggestMedia(country_id)

    print('Getting Words for {0}...'.format(country_name))
    data[country_id]['words'] = getTopWords(country_id)

    print('Getting NYT Labels for {0}...'.format(country_name))
    data[country_id]['labels'] = getEntities(country_id, NYT_LABELS_TAG_SET)

    print('Getting Places for {0}...'.format(country_name))
    data[country_id]['places'] = getEntities(country_id, GEO_TAG_SET)

    print('Getting Organizations for {0}...'.format(country_name))
    data[country_id]['orgs']   = getEntities(country_id, CLIFF_ORGS_TAG_SET)

    print('Getting People for {0}...'.format(country_name))
    data[country_id]['people'] = getEntities(country_id, CLIFF_PEOPLE_TAG_SET)

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

  random.shuffle(c[country_id]['media'])
  random_media = c[country_id]['media'][:10]
  random_media = [addType(entity, 'media') for entity in random_media]

  random.shuffle(c[country_id]['words'])
  random_words = c[country_id]['words'][:10]
  random_words = [addType(entity, 'word') for entity in random_words]

  all_entities = random_labels + random_places + random_orgs + random_people + random_media + random_words

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

  return word


# /////////////////////////////////////////////////////////////////////////
@app.route('/getBiggestMedia/<int:collection_id>')  
def getBiggestMedia(collection_id):
  media = mc_admin.mediaList(rows=10, tags_id=collection_id, sort='num_stories')

  return media

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
    t.update(COUNTRY_ALPHA_TO_LAT_LONG[t['alpha3']])
  return jsonify(country_tags)

@app.route('/getGlobeData/<int:collection_id>')
def getGlobeData(collection_id):
  lat_long_mag = []

  geo_tags = mc_admin.sentenceFieldCount('tags_id_media:{0}'.format(collection_id), tag_sets_id=1011)
  country_tags = [t for t in geo_tags if int(t['tag'].split('_')[1]) in COUNTRY_GEONAMES_ID_TO_APLHA3.keys()]
  for t in country_tags:
    alpha3 = COUNTRY_GEONAMES_ID_TO_APLHA3[int(t['tag'].split('_')[1])]
    latlong = COUNTRY_ALPHA_TO_LAT_LONG[alpha3]
    lat_long_mag.append(latlong['lat'])
    lat_long_mag.append(latlong['long'])
    lat_long_mag.append(t['count'])
  
  data = [['seriesA', lat_long_mag]]
  return jsonify(data)


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