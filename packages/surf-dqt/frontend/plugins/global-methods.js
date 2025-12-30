import MC from '@/nuxt.config'

export default ({ store, app, $config }, inject) => {
  // /////////////////////////////////////////////////////////// Get Single Menu
  // ---------------------------------------------------------------------------
  inject('getMenu', (menuName) => {
    const navigationList = store.getters['navigation/navigationList']
    if (!Array.isArray(navigationList)) { return false }
    const menu = store.getters['navigation/navigationList'].find(({ name }) => name === menuName)
    if (menu) { return menu }
    return false
  })
  // ////////////////////////////////////////////////////// Get Single Meta Item
  // ---------------------------------------------------------------------------
  inject('getMetaItem', (obj, metaItemName) => {
    const metadata = obj.metadata
    if (metadata) {
      const metaItem = metadata[metaItemName]
      if (metaItem) { return metaItem }
      return false
    }
    return 'This item does not have any Metadata.'
  })
  // /////////////////////////////////////////////////////////////////// Slugify
  // ----------------------- Options: 'dash', 'underscore', 'underscore-no-trim'
  inject('slugify', (text, type) => {
    if (type) {
      if (type === 'dash') {
        return text.toString().toLowerCase()
          .replace(/\s+/g, '-') // Replace spaces with -
          .replace(/[^\w-]+/g, '') // Remove all non-word chars
          .replace(/--+/g, '-') // Replace multiple - with single -
          .replace(/^-+/, '') // Trim - from start of text
          .replace(/-+$/, '') // Trim - from end of text
      } else if (type === 'underscore') {
        return text.toString().toLowerCase()
          .replace(/\s+/g, '_') // Replace spaces with _
          .replace(/[^\w_]+/g, '') // Remove all non-word chars
          .replace(/__+/g, '_') // Replace multiple _ with single _
          .replace(/^_+/, '') // Trim _ from start of text
          .replace(/_+$/, '') // Trim _ from end of text
      } else if (type === 'underscore-no-trim') {
        return text.toString().toLowerCase()
          .replace(/\s+/g, '_') // Replace spaces with _
          .replace(/[^\w_]+/g, '') // Remove all non-word chars
          .replace(/__+/g, '_') // Replace multiple _ with single _
      } else {
        return 'Incompatible "Type" specified. Must be type "dash", "underscore", or "underscore-no-trim". Default is "dash"'
      }
    } else {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
    }
  })
  // /////////////////////////////////////////////////////////////// Parse a URL
  // ----------------- https://www.abeautifulsite.net/parsing-urls-in-javascript
  inject('parseURL', (url) => {
    const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i)
    const urlBreakdown = {}
    let hostname = null
    let domain = null
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
      hostname = match[2]
    }
    const urlParts = hostname.split('.').reverse()
    if (urlParts != null && urlParts.length > 1) {
      domain = urlParts[1] + '.' + urlParts[0]
      if (hostname.toLowerCase().includes('.co.uk') !== -1 && urlParts.length > 2) {
        domain = urlParts[2] + '.' + domain
      }
    }
    urlBreakdown.hostname = hostname
    urlBreakdown.domain = domain
    return urlBreakdown
  })
  // ////////////////////////////////////////////////////// Throttle From Lodash
  // ---------------------------------------------------------------------------
  inject('throttle', (func, wait, options) => {
    let context
    let args
    let result
    let timeout = null
    let previous = 0
    if (!options) { options = {} }
    const later = function () {
      previous = options.leading === false ? 0 : Date.now()
      timeout = null
      result = func.apply(context, args)
      if (!timeout) { context = args = null }
    }
    return function () {
      const now = Date.now()
      if (!previous && options.leading === false) { previous = now }
      const remaining = wait - (now - previous)
      context = this
      args = arguments
      if (remaining <= 0 || remaining > wait) {
        if (timeout) { clearTimeout(timeout); timeout = null }
        previous = now
        result = func.apply(context, args)
        if (!timeout) { context = args = null }
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining)
      } return result
    }
  })
  // ///////////////////////////////////////// Check if Element contains a class
  // ---------------------------------------------------------------------------
  inject('hasClass', (element, className) => {
    if (element.classList) { return element.classList.contains(className) }
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className)
  })
  // ///////////////////////////////////////// Check if Element contains a class
  // ---------------------------------------------------------------------------
  inject('objectToSingleDepth', (arr, key) => {
    const len = arr.length
    const singleDepth = []
    if (len > 0) {
      for (let i = 0; i < len; i++) { singleDepth.push(arr[i][key]) }
      if (singleDepth.length > 0) { return singleDepth }
      return false
    }
    return false
  })
  // ///////////////////////////////////////////// If on iOS, return the version
  // ----------------------- supports iOS 2.0 and later -- https://bit.ly/TJjs1V
  inject('iOSversion', (element, className) => {
    if (/iP(hone|od|ad)/.test(navigator.platform)) {
      const v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/)
      return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)]
    }
    return false
  })
  // ////////////////////////////// Add class to NodeList staggered-sequentially
  // ---------------------------------------------------------------------------
  inject('staggeredAddClass', (elements, className, offset, next) => {
    const len = elements.length - 1
    let num = 0
    const interval = setInterval(() => {
      const item = elements[num] ? elements[num].$el || elements[num] : null
      if (!item) {
        clearInterval(interval)
        if (next) { return next() }
      } else {
        item.classList.add(className)
      }
      if (num === len) {
        clearInterval(interval)
        if (next) { return next() }
      }
      num++
    }, offset)
  })
  // ////////////////////////////////////////// Remove all HTML tags from string
  // ---------------------------------------------------------------------------
  inject('stripHTMLTags', (string, next) => {
    return string.replace(/(<([^>]+)>)/ig, ' ')
  })
  // /////////////////////////////////////////// Limit string by character count
  // ---------------------------------------------------------------------------
  inject('limitChars', (string, limit = 215, append = '...', next) => {
    return string.slice(0, limit).replace(/\s*$/, '') + append
  })
  // ////////////////////////////////////////// Remove all HTML tags from string
  // ---------------------------------------------------------------------------
  inject('lockAdmin', () => {
    return MC.void.admin.lockAdmin
  })
  // ////////////////////////////////////////// Remove all HTML tags from string
  // ---------------------------------------------------------------------------
  inject('getImageUrl', (filename, size) => {
    return `${$config.backendUrl}/image/${size}/${filename}`
  })
}
