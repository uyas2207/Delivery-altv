export default {
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "chrome": "80",
          "node": "16"
        },
        "modules": "auto",
        "useBuiltIns": false
      }
    ]
  ]
}
