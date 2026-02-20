NUXT
- Add ability to manually assign a slug for blocks
- Add warning for when trying to delete a collection
- Remove warning offset in Block editor and instead just make it overlay on top directly
- BUG: When Media Modal is opened, Metadata modal should close

EXPRESS
- Automatically check for and create /data, /public/csv and /public/image folders
- Change MC.frontendUrl
- Re-enable secure flag on cookie

# Surf DQT Suicide Data Visualization VueJS Frontend

// ----------------------------------------------------------------------- TO DO
// =============================================================================

// ------------------------------------------------------------------------ NUXT
### BUGS
- Debounce Filter component so that we're not sending too many xhr requests

### General

// --------------------------------------------------------------------- EXPRESS
### Bugs
- Searching for a Result and then clicking on "Load More" is not taking search term into account it seems

### General
- Remove 'PopulateHelpersFile' function instigator in Modules/Result/helpers.js
- Uploading media should go into a /tmp folder first and then be moved (re: if there's an error, it's easy to clear /tmp folder)
- In media_upload function, return the error in the Promise
- If Unauthenticated (ex: tab still open BUT cookie has expired), redirect to /login page?

### Mailer
- Implement a mailer
- Create a password reset email template

// ------------------------------------------------------------------------ BOTH
### Bug
- Changing the name of a Role breaks the app

### General
- Add ability to upload SVG media files
- Add ability to delete Media items

### Media Uploader
- Implement ability to delete media items

// --------------------------------------------------------------- Documentation
// =============================================================================

### Toaster
- Categories: loading, caution, warning, error, success

## Review Later
- Look into ApolloClient caching

### Server
pm2 start npm --name "surfdqt-frontend" -- start
pm2 start app.js --name "surfdqt-backend"
- https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-18-04

// ------------------------------------------------------------------- Resources
// =============================================================================
https://vuejsdevelopers.com/2019/01/22/vue-what-is-next-tick/
