# @kites/spa

Single Page Application Extension.

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/core.svg?style=flat)](https://www.npmjs.com/package/@kites/core)
[![npm downloads](https://img.shields.io/npm/dm/@kites/core.svg)](https://www.npmjs.com/package/@kites/core)

Main Features
=============

* [x] Serve static Single Page Application
* [x] Allowing multiple pages configuration

Extension Options
=================

* `enabled`: Enable/disable extension (default: true)
* `pages`: routes and pages configuration

Example
=======

```json
{
  "spa": {
    "pages": {
      "/about": "docs/about.html",
      "/*": "docs/index.html"
    }
  }
}
```

