import { Button } from 'antd';
import React, { Component } from 'react';

export interface IDemoProps {
  title?: string;
}

class TsDemo extends Component<IDemoProps> {
  render() {
    return <Button />;
  }
}

export default TsDemo;
