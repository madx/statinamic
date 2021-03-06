import test from "ava"

import { join } from "path"
import configurator from ".."

test("should return a default configuration", (t) => {
  const config = configurator({}, [])

  const expected = {
    cwd: process.cwd(),
    source: "content",
    destination: "dist",
    assets: {
      path: join(process.cwd(), "content", "assets"),
      route: "assets",
    },
    CNAME: false,
    nojekyll: true,
    devHost: "0.0.0.0",
    devPort: "3000",
    appcache : false,
    verbose: false,
    open: true,
    dev: false,
    production: false,
    static: false,
    server: false,
    baseUrl: {
      protocol: "http:",
      slashes: true,
      auth: null,
      host: "0.0.0.0:3000",
      port: "3000",
      hostname: "0.0.0.0",
      hash: null,
      search: null,
      query: null,
      pathname: "/",
      path: "/",
      href: "http://0.0.0.0:3000/",
    },
  }

  t.same(
    config,
    expected
  )
})

test("should allow to override some default values", (t) => {
  const config = configurator(
    {
      statinamic: {
        "CNAME": true,
        "devPort": "2000",
      },
    },
    [ "--devHost=1.2.3.4" ]
  )

  t.is(config.CNAME, true)
  t.is(config.devPort, "2000")
  t.is(config.devHost, "1.2.3.4")
})

test("should warn if config is invalid", (t) => {
  t.throws(
    () => {
      configurator({
        statinamic: {
          "lol": true,
        },
      })
    },
    (error) => error.message.includes("Unknow option 'lol'.")
  )
})

test("should warn if config is invalid when '--production' is used", (t) => {
  t.throws(
    () => {
      configurator({}, [ "--production" ])
    },
    (error) => error.message.includes("Your package.json require a 'homepage'")
  )
})

test("should not warn if config is valid when '--production' is used", (t) => {
  process.env.NODE_ENV = undefined
  const config = configurator({ homepage: "http://te.st/" }, [ "--production" ])
  t.is(config.baseUrl.href, "http://te.st/")
})

test("should adjust 'NODE_ENV' when '--production' is used", (t) => {
  process.env.NODE_ENV = undefined
  configurator({ homepage: "http://a.b/" }, [ "--production" ])
  t.is(process.env.NODE_ENV, "production")
})

test("should accept string for 'asset' option", (t) => {
  const config = configurator({
    statinamic: {
      "assets": "AsSeT",
    },
  })
  t.same(
    config.assets,
    {
      path: join(process.cwd(), config.source, "AsSeT"),
      route:"AsSeT",
    }
  )
})

test("should accept true for 'asset' option", (t) => {
  const config = configurator({
    statinamic: {
      "assets": true,
    },
  })
  t.same(
    config.assets,
    {
      path: join(process.cwd(), config.source, "assets"),
      route:"assets",
    }
  )
})

test("should not accept false for 'asset' option", (t) => {
  const config = configurator({ statinamic: { "assets": false } })
  t.is(config.assets, false)
})

test("should not accept null for 'asset' option", (t) => {
  const config = configurator({ statinamic: { "assets": null } })
  t.is(config.assets, null)
})

test("should accept object for 'asset' option", (t) => {
  t.throws(
    () => {
      configurator({ statinamic: { assets: { } } })
    },
    (error) => error.message.includes(
      "You provided an object for 'assets' option."
    )
  )
})

test("should default to false for 'appcache' option", (t) => {
  t.is(
    configurator({}).appcache,
    false
  )
})

test("should accept string for 'appcache' option", (t) => {
  t.same(
    configurator({ statinamic: { appcache: "foo" } }).appcache,
    [ "foo" ]
  )
})

test("should accept array for 'appcache' option", (t) => {
  t.same(
    configurator({ statinamic: { appcache: [ "foo" ] } }).appcache,
    [ "foo" ]
  )
})

test("should return default config when 'appcache' is true", (t) => {
  t.same(
    configurator({ statinamic: { appcache: true } }).appcache,
    [ "**/*.*", "!**/*.html", "index.html" ]
  )
})

test("should accept falsy for 'appcache' option", (t) => {
  t.is(
    configurator({ statinamic: { appcache: false } }).appcache,
    false
  )
  t.is(
    configurator({ statinamic: { appcache: null } }).appcache,
    false
  )
})

test("should not accept object for 'appcache' option", (t) => {
  t.throws(
    () => {
      configurator({ statinamic: { appcache: { foo: "bar" } } })
    },
    (error) => error.message.includes(
      "You provided an 'object' for 'appcache' option."
    )
  )
})
