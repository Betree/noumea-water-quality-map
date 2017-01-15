class NavMenu extends React.Component {
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
                <a className="button is-small" >
                  <span className="icon is-small">
                    <i className="fa fa-twitter"></i>
                  </span>
                  <span>Tweet</span>
                </a>
                <a className="button is-small" >
                  <span className="icon is-small">
                    <i className="fa fa-facebook"></i>
                  </span>
                  <span>Share</span>
                </a>
                <a className="button is-small" >
                  <span className="icon is-small">
                    <i className="fa fa-github"></i>
                  </span>
                  <span>Fork</span>
                </a>
              </span>
            </div>
          </nav>;
  }
}

ReactDOM.render(
  <NavMenu />,
  document.getElementById('nav-menu')
);
