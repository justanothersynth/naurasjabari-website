// ------------------------------------------------------------------------ NUXT
// =============================================================================
### General
- Create a "Group" toast structure
  - Ex: if several formatting errors are present, they should be displayed in a group
- Consolidate FormInput fields in Single pages so as to reduce HTML
- If a field is empty but NOT required, display a different state from bright red
- When dragging a subBlock, ALL other subblocks on the page should have their overlays activated?
- Need to be able to track changes in Blocks
- When deleting a Media item, display all the places where that Media item is being actively used
- Add the ability to delete a Media item's files from disk
- Add slugification to Media items
- If navigating away from a page - WARN THE USER that they haven't hit the save button (if there are unsaved changes)
- Media Editor: clicking on a size should copy its link to your clipboard
- Add ability to highlight text within areas that have search (similar to Filecoin)

### History (User + Result)
- Record which user created another user
- Record which user created a Result
- Record every time a change is made and which user made the change (just a timestamp is good)

### Refactor
- Break up Store actions into separate files

### Change Tracking
- Toast: required fields should be listed if they're missing
  - https://www.apollographql.com/docs/apollo-server/data/errors/#augmenting-error-details

### Error Handling
- Modules: loop through nuxt config options and throw errors rather than doing them all manually?

### Messages
- Implement message stream

// --------------------------------------------------------------------- EXPRESS
// =============================================================================
### Housekeeping
- File names (especially images) should be sluggified and slugs should be checked before uploading
- Optimize queries: https://medium.com/faun/performance-tips-for-mongodb-mongoose-190732a5d382
- All endpoints should check params and send back errors if params are missing before running
- Create a cron job that deletes Blocks labelled as TRASH
- Add try/catch statements everywhere
- Investigate how to avoid use of 'i' flag for RegExp inside of QueryBuilder to improve performance
  - https://stackoverflow.com/questions/7101703/how-do-i-make-case-insensitive-queries-on-mongodb

### Security
- Protect against brute force attacks: https://expressjs.com/en/advanced/best-practice-security.html

// ------------------------------------------------------------------------ BOTH
// =============================================================================
### General
- Link block: validate links
- Login Page: Validate email addresses
- New User Page: Validate email addresses
- Investigate conversion to multi-threaded functioning: https://www.quora.com/Is-it-pointless-to-run-node-js-on-a-multi-core-cpu-because-node-js-is-single-threaded
- Implement bulk editing
- Add a "This Record is currently being edited" flag
- Implement "own" authorization level
- Implement a "Root user" flag and "Superuser" flag
  - These users can NOT be deleted in any way (even self-deletion)
- Create a Group Block
- Media Block: enable multiple image selections
- If a block is repeatable, only output subblocks that have content. (re: no empty strings for example)

### Search
- Implement global search-as-you-type with suggestions
