# Noumea water quality map

This project intend to provide a very basic way to provide a map of water pollution.

It is fuly static and focus on the view (client side). You may fit it to your
own project by changing the way GeoJSON files are generated.

## How to use

The web part doesn't need any specific server, all the code lays in HTML/JS/CSS.

However, you need python if you want to run the data extraction from Noumea's
pdf files.

- Install dependencies
TODO: pdftohtml

    pip install geojson PyYAML


## Libraries / third parties

  - LeafletJS : to render maps
  - OpenStreetMap : map data provider
  - ReactJS : for dynamic UI
  - Bulma : for easy & pretty UI
  - PDFMiner : python library to extract data from Noumea's pdf files
  - Noumea city council (Mairie de Nouméa) : for water quality data

See [this link](http://www.noumea.nc/prevention-et-securite/hygiene-et-securite-sanitaire/qualite-des-eaux) for original data sources
