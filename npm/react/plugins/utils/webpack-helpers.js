// @ts-check
const debug = require('debug')('@cypress/react')

/**
 * Note: modifies the input options object
 */
function addImageRedirect (webpackOptions) {
  if (!webpackOptions.module) {
    debug('webpack options has no "module"')

    return
  }

  if (!Array.isArray(webpackOptions.module.rules)) {
    debug('webpack module rules is not an array')

    return
  }

  debug('adding image redirect to %o', webpackOptions)

  // we need to handle static images and redirect them to
  // the existing files. Cypress has fallthrough static server
  // for anything like "/_root/<path>" which is perfect - because
  // importing a static image gives us that <path>!
  // insert our loader first before any built-in loaders kick in
  const loaderRules = webpackOptions.module.rules.find((rule) => {
    return Array.isArray(rule.oneOf)
  })

  const imageRedirectLoaderRule = {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
    loader: require.resolve('./redirect-image-resource'),
  }

  if (loaderRules) {
    debug('found oneOf rule %o', loaderRules.oneOf)
    debug('adding our static image loader')
    loaderRules.oneOf.unshift(imageRedirectLoaderRule)

    // while we are here, let's change file loader
    // to point it at the /__root/... path
    const fileLoader = loaderRules.oneOf[loaderRules.oneOf.length - 1]

    if (
      fileLoader &&
      fileLoader.loader &&
      fileLoader.loader.includes('file-loader')
    ) {
      if (fileLoader.options && fileLoader.options.name) {
        debug('setting file-loader to output /__root')
        fileLoader.options.name = '/__root/[path][name].[ext]'
        debug('file loader %o', fileLoader)
      }
    }
  } else {
    debug('could not find oneOf rules, inserting directly into rules')
    webpackOptions.module.rules.unshift(imageRedirectLoaderRule)
  }
}

/**
 * Finds the ModuleScopePlugin plugin and adds given folder
 * to that list. This allows react-scripts to import folders
 * outside of the default "/src" folder.
 * WARNING modifies the input webpack options argument.
 * @see https://github.com/bahmutov/cypress-react-unit-test/issues/289
 * @param {string} folderName Folder to add, should be absolute
 */
function allowModuleSourceInPlace (folderName, webpackOptions) {
  if (!folderName) {
    return
  }

  if (!webpackOptions.resolve) {
    return
  }

  if (!Array.isArray(webpackOptions.resolve.plugins)) {
    return
  }

  const moduleSourcePlugin = webpackOptions.resolve.plugins.find((plugin) => {
    return Array.isArray(plugin.appSrcs)
  })

  if (!moduleSourcePlugin) {
    debug('cannot find module source plugin')

    return
  }

  debug('found module source plugin %o', moduleSourcePlugin)
  if (!moduleSourcePlugin.appSrcs.includes(folderName)) {
    moduleSourcePlugin.appSrcs.push(folderName)
    debug('added folder %s to allowed sources', folderName)
  }
}

module.exports = { addImageRedirect, allowModuleSourceInPlace }
