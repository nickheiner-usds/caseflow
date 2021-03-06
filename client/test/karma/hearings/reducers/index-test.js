import { expect } from 'chai';
import * as Hearings from '../../../../app/hearings/reducers/index';
import * as Constants from '../../../../app/hearings/constants/constants';

/* eslint max-statements: ["error", 10, { "ignoreTopLevelFunctions": true }]*/
describe('hearingsReducer', () => {
  let initialState;

  beforeEach(() => {
    initialState = Hearings.mapDataToInitialState({
      dockets: {
        '2017-08-10': {
          hearings_array: {
            0: {}
          }
        }
      },
      worksheet: {
      },
      worksheetIssues: {
        6: { }
      },
      worksheetAppeals: {
      }
    });
  });

  // Dockets
  context(Constants.SET_NOTES, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_NOTES,
        payload: {
          hearingIndex: 0,
          notes: 'this is my note',
          date: '2017-08-10'
        }
      });
    });

    it('sets notes', () => {
      expect(state.dockets).to.deep.equal({ '2017-08-10': { hearings_array: { 0: { notes: 'this is my note',
        edited: true } } } });
    });
  });

  context(Constants.SET_DISPOSITION, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_DISPOSITION,
        payload: {
          hearingIndex: 0,
          disposition: 'no_show',
          date: '2017-08-10'
        }
      });
    });

    it('sets disposition', () => {
      expect(state.dockets).to.deep.equal({ '2017-08-10': { hearings_array: { 0: { disposition: 'no_show',
        edited: true } } } });
    });
  });

  context(Constants.SET_HOLD_OPEN, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_HOLD_OPEN,
        payload: {
          hearingIndex: 0,
          holdOpen: 60,
          date: '2017-08-10'
        }
      });
    });

    it('sets hold open', () => {
      expect(state.dockets).to.deep.equal({ '2017-08-10': { hearings_array: { 0: { hold_open: 60,
        edited: true } } } });
    });
  });

  context(Constants.SET_AOD, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_AOD,
        payload: {
          hearingIndex: 0,
          aod: 'filed',
          date: '2017-08-10'
        }
      });
    });

    it('sets aod', () => {
      expect(state.dockets).to.deep.equal({ '2017-08-10': { hearings_array: { 0: { aod: 'filed',
        edited: true } } } });
    });
  });

  context(Constants.SET_TRANSCRIPT_REQUESTED, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_TRANSCRIPT_REQUESTED,
        payload: {
          hearingIndex: 0,
          transcriptRequested: true,
          date: '2017-08-10'
        }
      });
    });

    it('sets transcript requested', () => {
      expect(state.dockets).to.deep.equal({ '2017-08-10': { hearings_array: { 0: { transcript_requested: true,
        edited: true } } } });
    });
  });

  // Worksheet
  context(Constants.SET_REPNAME, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_REPNAME,
        payload: {
          repName: 'John Smith'
        }
      });
    });

    it('sets worksheet rep name', () => {
      expect(state.worksheet.representative_name).to.deep.equal('John Smith');
    });
  });

  context(Constants.SET_WITNESS, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_WITNESS,
        payload: {
          witness: 'Jane Doe'
        }
      });
    });

    it('sets worksheet contentions', () => {
      expect(state.worksheet.witness).to.deep.equal('Jane Doe');
    });
  });

  context(Constants.SET_CONTENTIONS, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_CONTENTIONS,
        payload: {
          contentions: 'filled'
        }
      });
    });

    it('sets worksheet contentions', () => {
      expect(state.worksheet.contentions).to.deep.equal('filled');
    });
  });

  context(Constants.SET_MILITARY_SERVICE, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_MILITARY_SERVICE,
        payload: {
          militaryService: 'filled'
        }
      });
    });

    it('sets worksheet military service', () => {
      expect(state.worksheet.military_service).to.deep.equal('filled');
    });
  });

  context(Constants.SET_EVIDENCE, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_EVIDENCE,
        payload: {
          evidence: 'filled'
        }
      });
    });

    it('sets evidence', () => {
      expect(state.worksheet.evidence).to.deep.equal('filled');
    });
  });

  context(Constants.SET_COMMENTS_FOR_ATTORNEY, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_COMMENTS_FOR_ATTORNEY,
        payload: {
          commentsForAttorney: 'filled'
        }
      });
    });

    it('sets worksheet comments for attorney', () => {
      expect(state.worksheet.comments_for_attorney).to.deep.equal('filled');
    });
  });

  // Issues
  context(Constants.SET_DESCRIPTION, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_DESCRIPTION,
        payload: {
          description: 'Elbow Arthritis',
          issueId: 6
        }
      });
    });

    it('sets description', () => {

      expect(state.worksheetIssues).to.deep.equal({
        6: { description: 'Elbow Arthritis',
          edited: true }
      }
      );
    });
  });

  context(Constants.SET_REOPEN, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_REOPEN,
        payload: { reopen: true,
          issueId: 6
        }
      });
    });

    it('sets worksheet issue reopen', () => {
      expect(state.worksheetIssues).to.deep.equal({
        6: { reopen: true,
          edited: true }
      }
      );
    });
  });

  context(Constants.SET_ALLOW, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_ALLOW,
        payload: { allow: true,
          issueId: 6
        }
      });
    });

    it('sets worksheet issue allow', () => {
      expect(state.worksheetIssues).to.deep.equal({
        6: { allow: true,
          edited: true }
      }
      );
    });
  });

  context(Constants.SET_DENY, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_DENY,
        payload: { deny: true,
          issueId: 6
        }
      });
    });

    it('sets worksheet issue deny', () => {
      expect(state.worksheetIssues).to.deep.equal({
        6: { deny: true,
          edited: true }
      }
      );
    });
  });

  context(Constants.SET_REMAND, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_REMAND,
        payload: { remand: true,
          issueId: 6
        }
      });
    });

    it('sets worksheet issue remand', () => {
      expect(state.worksheetIssues).to.deep.equal({
        6: { remand: true,
          edited: true }
      }
      );
    });
  });

  context(Constants.SET_DISMISS, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_DISMISS,
        payload: { dismiss: true,
          issueId: 6
        }
      });
    });

    it('sets worksheet issue dismiss', () => {
      expect(state.worksheetIssues).to.deep.equal({
        6: { dismiss: true,
          edited: true }
      }
      );
    });
  });

  context(Constants.SET_VHA, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.SET_VHA,
        payload: { vha: true,
          issueId: 6
        }
      });
    });

    it('sets worksheet issue vha', () => {
      expect(state.worksheetIssues).to.deep.equal({
        6: { vha: true,
          edited: true }
      }
      );
    });
  });

  context(Constants.DELETE_ISSUE, () => {
    let state;

    beforeEach(() => {
      state = Hearings.hearingsReducers(initialState, {
        type: Constants.DELETE_ISSUE,
        payload: { _destroy: true,
          issueId: 6 }
      });
    });

    it('deletes worksheet issue', () => {
      expect(state.worksheetIssues).to.deep.equal({
        6: { _destroy: true,
          edited: true }
      }
      );
    });
  });
});
