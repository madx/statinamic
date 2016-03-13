import { join } from "path"
import fs from "fs-promise"
import color from "chalk"
import debug from "debug"

import webpack from "./webpack"
import devServer from "./server"

import collection from "../content-loader/cache"
import toStaticHTML from "../static"

export default async function(options) {
  const {
    config,
    store,
    exports,
  } = options

  const log = debug("statinamic:builder")

  try {
    const destination = join(config.cwd, config.destination)
    await fs.emptyDir(destination)

    if (config.static) {
      // Copy static assets to build folder
      if (config.assets) {
        await fs.copy(
          config.assets.path,
          join(destination, config.assets.route)
        )
        log(color.green("✓ Static assets: copy static assets completed"))
      }

      const stats = await webpack(config.webpackConfigClient, log)
      log(color.green("✓ Static assets: client build completed"))

      const assetsFiles = { css: [], js: [] }
      const assets = stats.toJson().assetsByChunkName

      // Flatten object of arrays
      // sort a-z => predictable chunks order
      Object.keys(assets)
        .reduce((result, key) => {
          const chunkAssets = assets[key]
          return result.concat(chunkAssets)
        }, [])
        .sort((a, b) => (a.toLowerCase() > b.toLowerCase()) ? 1 : -1)
        .forEach((name) => {
          if (name.endsWith(".js")) {
            assetsFiles.js.push(name)
          }
          else if (name.endsWith(".css")) {
            assetsFiles.css.push(name)
          }
        })

      await toStaticHTML({
        ...config,
        urls: [
          ...options.urls || [],
          ...collection.map((item) => item.__url),
        ],
        collection,
        assetsFiles,
        exports,
        store,
      })
      if (config.server) {
        devServer(null, { config })
      }
    }
    else if (config.server) {
      devServer({
        config,
        exports,
        store,
      })
    }
    else {
      throw new Error("You need to specify --static or --server")
    }
  }
  catch (err) {
    setImmediate(() => {
      throw err
    })
  }
}
