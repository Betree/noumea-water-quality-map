module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'app.js': /^app/
      }
    },
    stylesheets: {joinTo: 'app.css'}
  },

  plugins: {
    babel: {
      presets: ['es2015', 'es2016', 'react'],
      ignore: [/^(node_modules)/]
    },
    sass: {
      options: {
        includePaths: ["node_modules"]
      }
    },
    copycat: {
      "fonts": "node_modules/font-awesome/fonts",
      "leaflet": "node_modules/leaflet/dist/leaflet.css",
      "leaflet/images": "node_modules/leaflet/dist/images",
      "data": "data"
    }
  }

};
