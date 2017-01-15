class NavMenu extends React.Component {
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
              <a href="index.html" className="nav-item">
                Map
              </a>
              <a href="about.html" className="nav-item">
                A propos
              </a>
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
