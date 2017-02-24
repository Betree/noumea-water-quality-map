import React from "react"
import ReactDOM from "react-dom"


const SHARING_ENCODED = "https%3A%2F%2Fgoo.gl%2FWSQOeG%20Une%20map%20de%20la%20qualit%C3%A9%20de%20l%27eau%20des%20plages%20pour%20Noum%C3%A9a%20%F0%9F%87%B3%F0%9F%87%A8%F0%9F%90%99%F0%9F%90%AC%F0%9F%8F%8A"

export default class NavMenu extends React.Component {
  get_page_name_from_href(href) {
    var splitHref = href.split('/')
    return splitHref[splitHref.length - 1]
  }

  get_active_link(href, name) {
    // Must be used only on a website without subdomains
    var activePage = this.get_page_name_from_href(document.location.toString())
    var linkPage = this.get_page_name_from_href(href)
    var isActive = activePage == linkPage ? ' is-active' : ''
    return <a href={href} className={`nav-item ${isActive}`}>{name}</a>
  }

  render() {
    return <nav id="main-nav" className="nav">
            <div className="nav-left">
              <a className="nav-item">
                Nouméa - Qualité de l'eau des plages
              </a>
            </div>
            <span className="nav-toggle">
              <span></span>
              <span></span>
              <span></span>
            </span>

            <div className="nav-center nav-menu">
              {this.get_active_link("index.html", "Map")}
              {this.get_active_link("about.html", "A propos")}
            </div>

            <div className="nav-right nav-menu">
              <span className="nav-item">
                <a target="_blank" className="button is-small" href="https://github.com/Betree/noumea-water-quality-map">
                  <span className="icon is-small">
                    🐙
                  </span>
                  <span>Fork</span>
                </a>
                <a target="_blank" className="button is-small"
                  href={`https://twitter.com/intent/tweet?text=${SHARING_ENCODED}`}>
                  <span className="icon is-small">
                    🐥
                  </span>
                  <span>Tweet</span>
                </a>
                <a target="_blank" className="button is-small" href="https://www.facebook.com/sharer/sharer.php?u=https%3A//goo.gl/WSQOeG">
                  <span>Share on Facebook</span>
                </a>
              </span>
            </div>
          </nav>;
  }
}
