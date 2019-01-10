import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Demo from '..';

Enzyme.configure({ adapter: new Adapter() });

test('Demo component should return correct output', () => {
  const wrapper = shallow(<Demo />);

  expect(wrapper.html()).toEqual('<button type="button" class="ant-btn abcd"><span>确 定</span></button>');
  expect(wrapper.text()).toEqual('<Button />');
});
