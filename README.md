# ITO Static data

fetch the gtfs timetable data from ITO. Upload the data to an S3 bucket. The S3 bucket will trigger a notification to import the new GTFS data in to the motion map datastore.

## Npm Install

There is a post install hook `find ./node_modules -mtime +10950 -exec touch {} \\;` which is a mild hack to make sure that no install libraries have a modification date before 1980. The AWS deploy scripts fail when this is the case.
