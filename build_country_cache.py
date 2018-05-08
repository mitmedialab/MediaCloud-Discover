import json
import logging
from server import mc_admin

# Read from whitelist, create country files, write entity data as JSON
logger = logging.getLogger(__name__)

# Tag sets that hold tags on stories
NYT_LABELS_TAG_SET = 1963               # one tag per theme in a story (Jasmin's transfer-learning model)
GEO_TAG_SET = 1011                      # one tag per country/state stories are about (disambiguated)
CLIFF_ORGS_TAG_SET = 2388               # one tag for each org mentioned in stories
CLIFF_PEOPLE_TAG_SET = 2389             # one tag for each person mentioned in stories

FETCH_ENTITIES = True


# /////////////////////////////////////////////////////////////////////////
def get_entities(collection_id, tag_set):
    entities = mc_admin.sentenceFieldCount('*',
                                           ['tags_id_media:{}'.format(collection_id),
                                            'publish_date:NOW to NOW-3MONTH'],
                                           tag_sets_id=tag_set,
                                           sample_size=5000)
    return entities


# /////////////////////////////////////////////////////////////////////////
def get_top_words(collection_id):
    word = mc_admin.wordCount('*',
                              ['tags_id_media:{0}'.format(collection_id), 'publish_date:NOW to NOW-3MONTH'],
                              num_words=100,
                              sample_size=5000)
    return word


# /////////////////////////////////////////////////////////////////////////
def get_biggest_nedia(collection_id):
    media = mc_admin.mediaList(rows=10, tags_id=collection_id, sort='num_stories')
    return media

logger.info('Starting to generate local country data files')

# /////////////////////////////////////////////////////////////////////////
with open('whitelist.json') as f:
    whitelist = json.load(f)
    for item in whitelist:
        logger.info('{}: {}'.format(item['country_name'], item['id']))

        with open('cache/{0}.json'.format(item['country_name']), 'w') as out:
            
            data = {'name': item['country_name'], 'id': item['id']}

            logger.info('  Getting Media for {0}...'.format(item['country_name']))
            data['media'] = get_biggest_nedia(item['id'])

            logger.info('  Getting Words for {0}...'.format(item['country_name']))
            data['words'] = get_top_words(item['id'])

            if FETCH_ENTITIES:

                logger.info('  Getting NYT Labels for {0}...'.format(item['country_name']))
                data['labels'] = get_entities(item['id'], NYT_LABELS_TAG_SET)

                logger.info('  etting Places for {0}...'.format(item['country_name']))
                data['places'] = get_entities(item['id'], GEO_TAG_SET)

                logger.info('  Getting Organizations for {0}...'.format(item['country_name']))
                data['orgs'] = get_entities(item['id'], CLIFF_ORGS_TAG_SET)

                logger.info('  Getting People for {0}...'.format(item['country_name']))
                data['people'] = get_entities(item['id'], CLIFF_PEOPLE_TAG_SET)

            else:

                data['labels'] = []
                data['places'] = []
                data['orgs'] = []
                data['people'] = []

            out.write(json.dumps(data))

logger.info('Done')
