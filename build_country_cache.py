from os import environ
import json
import logging
import mediacloud

# Read from whitelist, create country files, write entity data as JSON

logger = logging.getLogger(__name__)
api_key = environ.get('MC_API_KEY')
mc_admin = mediacloud.api.AdminMediaCloud(api_key)

# Tag sets that hold tags on stories
NYT_LABELS_TAG_SET = 1963               # one tag per theme in a story (Jasmin's transfer-learning model)
GEO_TAG_SET = 1011                      # one tag per country/state stories are about (disambiguated)
CLIFF_ORGS_TAG_SET = 2388               # one tag for each org mentioned in stories
CLIFF_PEOPLE_TAG_SET = 2389             # one tag for each perosn mentioned in stories


# /////////////////////////////////////////////////////////////////////////
def getEntities(collection_id, tag_set):
    entities = mc_admin.sentenceFieldCount('*',
                                           ['tags_id_media:{}'.format(collection_id),
                                            'publish_date:NOW to NOW-3MONTH'],
                                           tag_sets_id=tag_set,
                                           sample_size=5000)
    return entities


# /////////////////////////////////////////////////////////////////////////
def getTopWords(collection_id):
    word = mc_admin.wordCount('*',
                              ['tags_id_media:{0}'.format(collection_id), 'publish_date:NOW to NOW-3MONTH'],
                              num_words=100,
                              sample_size=5000)
    return word


# /////////////////////////////////////////////////////////////////////////
def getBiggestMedia(collection_id):
    media = mc_admin.mediaList(rows=10, tags_id=collection_id, sort='num_stories')
    return media

logger.info('Starting to generate local country data files')

# /////////////////////////////////////////////////////////////////////////
with open('whitelist.json') as f:
    whitelist = json.load(f)
    for item in whitelist:
        logger.info('{}: {}'.format(item['country_name'], item['id']))

        with open('cache/{0}.json'.format( item['country_name'] ), 'w') as out:
            
            data = { 'name': item['country_name'], 'id': item['id'] }

            logger.info('  Getting Media for {0}...'.format(item['country_name']))
            data['media'] = getBiggestMedia(item['id'])

            logger.info('  Getting Words for {0}...'.format(item['country_name']))
            data['words'] = getTopWords(item['id'])

            logger.info('  Getting NYT Labels for {0}...'.format(item['country_name']))
            data['labels'] = getEntities(item['id'], NYT_LABELS_TAG_SET)

            logger.info('  etting Places for {0}...'.format(item['country_name']))
            data['places'] = getEntities(item['id'], GEO_TAG_SET)

            logger.info('  Getting Organizations for {0}...'.format(item['country_name']))
            data['orgs']   = getEntities(item['id'], CLIFF_ORGS_TAG_SET)

            logger.info('  Getting People for {0}...'.format(item['country_name']))
            data['people'] = getEntities(item['id'], CLIFF_PEOPLE_TAG_SET)

            out.write(json.dumps(data))

logger.info('Done')
