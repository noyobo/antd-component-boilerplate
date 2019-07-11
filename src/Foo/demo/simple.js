import Foo from '@x2s/ppt-templates/Foo';
import { render } from 'react-dom';
import React, { Component } from 'react';

class App extends Component {
  render() {
    return <Foo />;
  }
}

render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
