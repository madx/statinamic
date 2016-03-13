import webpack from "webpack"
import color from "chalk"

export default (webpackConfig, log) => {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig)
    compiler.run((err, stats) => {
      const jsonStats = stats.toJson()

      debug('Webpack compile completed.')
      debug(stats.toString(statsFormat))

      if (err) {
        debug('Webpack compiler encountered a fatal error.', err)
        return reject(err)
      }
      else if (jsonStats.errors.length > 0) {
        debug('Webpack compiler encountered errors.')
        debug(jsonStats.errors.join('\n'))
        return reject(new Error('Webpack compiler encountered errors'))
      }
      else if (jsonStats.warnings.length > 0) {
        debug('Webpack compiler encountered warnings.')
        debug(jsonStats.warnings.join('\n'))
      }
      resolve(jsonStats)
    })
  })
}
