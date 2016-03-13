import webpack from "webpack"
// import color from "chalk"

export default (webpackConfig, log) => {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig)
    compiler.run((err, stats) => {
      const jsonStats = stats.toJson()

      if (err) {
        log("Webpack compiler encountered a fatal error.", err)
        return reject(err)
      }
      else if (jsonStats.errors.length > 0) {
        log("Webpack compiler encountered errors.")
        log(jsonStats.errors.join("\n"))
        return reject(new Error("Webpack compiler encountered errors"))
      }
      else if (jsonStats.warnings.length > 0) {
        log("Webpack compiler encountered warnings.")
        log(jsonStats.warnings.join("\n"))
      }
      resolve(jsonStats)
    })
  })
}
