import React, { PureComponent } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import CannotSaveAlert from '../reader/CannotSaveAlert';
import SearchableDropdown from '../components/SearchableDropdown';
import { addNewTag, removeTag } from '../reader/PdfViewer/PdfViewerActions';

class SideBarIssueTags extends PureComponent {
  render() {
    const {
      doc
    } = this.props;

    let generateOptionsFromTags = (tags) =>
      _(tags).
        reject('pendingRemoval').
        map((tag) => ({
          value: tag.text,
          label: tag.text,
          tagId: tag.id })
        ).
        value();

    let onChange = (values, deletedValue) => {
      if (_.size(deletedValue)) {
        const tagValue = _.first(deletedValue).label;
        const result = _.find(doc.tags, { text: tagValue });

        this.props.removeTag(doc, result.id);
      } else if (values && values.length) {
        this.props.addNewTag(doc, values);
      }
    };

    return <div className="cf-issue-tag-sidebar">
      {this.props.error.tag.visible && <CannotSaveAlert />}
      <SearchableDropdown
        key={doc.id}
        name="tags"
        label="Select or tag issue(s)"
        multi
        creatable
        options={generateOptionsFromTags(this.props.tagOptions)}
        placeholder=""
        value={generateOptionsFromTags(doc.tags)}
        onChange={onChange}
        selfManageValueState
      />
    </div>;
  }
}

const mapStateToProps = (state) => {
  return {
    error: state.readerReducer.ui.pdfSidebar.error,
    ..._.pick(state.readerReducer.ui, 'tagOptions')
  };
};

const mapDispatchToProps = (dispatch) => ({
  ...bindActionCreators({
    addNewTag,
    removeTag
  }, dispatch)
});

export default connect(
  mapStateToProps, mapDispatchToProps
)(SideBarIssueTags);
