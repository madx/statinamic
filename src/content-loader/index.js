import path from "path"
import loaderUtils from "loader-utils"
import frontMatterParser from "gray-matter"

import joinUri from "../_utils/join-uri"
import urlify from "../_utils/urlify"
import enhanceCollection from "../enhance-collection"
import feed from "./feed"
import cache from "./cache"
import description from "./description"
import validator from "./validator"
import defaultRenderer from "./default-renderer"

let timeout

module.exports = function(input) {
  const query = loaderUtils.parseQuery(this.query)

  try {
    validator(query)
  }
  catch (err) {
    this.emitError(err)
  }

  const context = query.context || this.options.context
  const renderer = query.renderer || defaultRenderer

  const defaultHead = query.defaultHead
  const parsed = frontMatterParser(input)

  const relativePath = path.relative(context, this.resourcePath)
  const tmpUrl = urlify(
    parsed.data.route
      // custom route
      ? parsed.data.route
      // default route
      : relativePath
  )

  const url = urlify(tmpUrl)
  const resourceUrl = urlify(tmpUrl, true)

  const hash = loaderUtils.getHashDigest(input)
  const dataUrl = resourceUrl + "." + hash + ".json"

  const metadata = {
    __filename: relativePath,
    __url: joinUri("/", url),
    __resourceUrl: joinUri("/", resourceUrl),
    __dataUrl: joinUri("/", dataUrl),
  }
  let textData = {
    head: {
      ...defaultHead,
      ...parsed.data,
    },
    body: renderer(parsed.content),
    rawBody: parsed.content,
    raw: parsed.orig,
    ...metadata,
  }

  textData = description(textData, query.description)

  if (!this.emitFile) {
    throw new Error("emitFile is required from module system")
  }

  // emit file
  this.emitFile(dataUrl, JSON.stringify(textData))

  // update collection
  // replace or add depending on the cache state
  let previousIndex
  cache.forEach((md, index) => {
    if (md.__filename === relativePath) {
      previousIndex = index
    }
  })
  if (previousIndex) {
    cache[previousIndex] = textData
  }
  else {
    cache.push(textData)
  }

  if (timeout) {
    clearTimeout(timeout)
  }
  else {
    setTimeout(() => {
      // emit updated feeds
      const feeds = query.feeds || []
      const feedsOptions = query.feedsOptions || {}
      Object.keys(feeds).forEach((name) => {
        const { feedOptions, collectionOptions } = feeds[name]
        this.emitFile(name, feed({
          feedOptions: {
            ...feedsOptions,
            ...feedOptions,
          },
          destination: name,
          collection: enhanceCollection(
            cache.map((item) => ({
              ...item.head,
              description: item.body,
              __url: item.__url,
            })),
            collectionOptions
          ),
        }))
      })
    }, 100)
  }

  return "module.exports = " + JSON.stringify(joinUri("/", dataUrl))
}
