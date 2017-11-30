import React from 'react';
import classnames from 'classnames';

export default class ChildNavLink extends React.PureComponent {
  onClick = () => {
    this.props.setSelectedLink(this.props.index);
  }

  showSelectedClass = () => {
    return classnames({ selected: this.props.index === this.props.selectedIndex });
  }

  render() {
    const { name, anchor, index, selectedIndex } = this.props;

    return <li><a href={anchor} onClick={this.onClick} className={this.showSelectedClass()}>{name}</a></li>;
  }
}
