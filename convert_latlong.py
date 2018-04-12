import pandas as pd
# open file
df = pd.read_csv('static/data/Country_List_ISO_3166_Codes_Latitude_Longitude.csv')
# load in PD

data = dict()

for index, row in df.iterrows():
	print( "{0} - {1}: {2}:{3}").format(row[0], row[2], row[4], row[5] )
	data[row[2]] = { 'lat': row[4], 'long': row[5] }

print(data)
# extract alpha3 and lat/long values into a dictionary

# output it as a string

