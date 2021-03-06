import * as Constants from '../constants/constants';
import ApiUtil from '../../util/ApiUtil';
import { CATEGORIES, debounceMs } from '../analytics';

export const populateDockets = (dockets) => ({
  type: Constants.POPULATE_DOCKETS,
  payload: {
    dockets
  }
});

export const populateWorksheet = (worksheet) => ({
  type: Constants.POPULATE_WORKSHEET,
  payload: {
    worksheet
  }
});

export const handleWorksheetServerError = (err) => ({
  type: Constants.HANDLE_WORKSHEET_SERVER_ERROR,
  payload: {
    err
  }
});

export const handleDocketServerError = (err) => ({
  type: Constants.HANDLE_DOCKET_SERVER_ERROR,
  payload: {
    err
  }
});

export const onRepNameChange = (repName) => ({
  type: Constants.SET_REPNAME,
  payload: {
    repName
  }
});

export const onWitnessChange = (witness) => ({
  type: Constants.SET_WITNESS,
  payload: {
    witness
  }
});

export const setNotes = (hearingIndex, notes, date) => ({
  type: Constants.SET_NOTES,
  payload: {
    hearingIndex,
    notes,
    date
  },
  meta: {
    analytics: {
      category: CATEGORIES.DAILY_DOCKET_PAGE,
      debounceMs
    }
  }
});

export const setDisposition = (hearingIndex, disposition, date) => ({
  type: Constants.SET_DISPOSITION,
  payload: {
    hearingIndex,
    disposition,
    date
  }
});

export const setHoldOpen = (hearingIndex, holdOpen, date) => ({
  type: Constants.SET_HOLD_OPEN,
  payload: {
    hearingIndex,
    holdOpen,
    date
  }
});

export const setAod = (hearingIndex, aod, date) => ({
  type: Constants.SET_AOD,
  payload: {
    hearingIndex,
    aod,
    date
  }
});

export const setTranscriptRequested = (hearingIndex, transcriptRequested, date) => ({
  type: Constants.SET_TRANSCRIPT_REQUESTED,
  payload: {
    hearingIndex,
    transcriptRequested,
    date
  }
});

export const onContentionsChange = (contentions) => ({
  type: Constants.SET_CONTENTIONS,
  payload: {
    contentions
  },
  meta: {
    analytics: {
      category: CATEGORIES.HEARING_WORKSHEET_PAGE,
      debounceMs
    }
  }
});

export const onMilitaryServiceChange = (militaryService) => ({
  type: Constants.SET_MILITARY_SERVICE,
  payload: {
    militaryService
  },
  meta: {
    analytics: {
      category: CATEGORIES.HEARING_WORKSHEET_PAGE,
      debounceMs
    }
  }
});

export const onEvidenceChange = (evidence) => ({
  type: Constants.SET_EVIDENCE,
  payload: {
    evidence
  },
  meta: {
    analytics: {
      category: CATEGORIES.HEARING_WORKSHEET_PAGE,
      debounceMs
    }
  }
});

export const onCommentsForAttorneyChange = (commentsForAttorney) => ({
  type: Constants.SET_COMMENTS_FOR_ATTORNEY,
  payload: {
    commentsForAttorney
  },
  meta: {
    analytics: {
      category: CATEGORIES.HEARING_WORKSHEET_PAGE,
      debounceMs
    }
  }
});

export const toggleWorksheetSaving = () => ({
  type: Constants.TOGGLE_WORKSHEET_SAVING
});

export const setWorksheetSaveFailedStatus = (saveFailed) => ({
  type: Constants.SET_WORKSHEET_SAVE_FAILED_STATUS,
  payload: {
    saveFailed
  }
});

export const saveWorksheet = (worksheet) => (dispatch) => {
  if (!worksheet.edited) {
    return;
  }

  ApiUtil.patch(`/hearings/worksheets/${worksheet.id}`, { data: { worksheet } }).
    then(() => {
      dispatch({ type: Constants.SET_WORKSHEET_EDITED_FLAG_TO_FALSE });
    },
    () => {
      dispatch({ type: Constants.SET_WORKSHEET_SAVE_FAILED_STATUS,
        payload: { saveFailed: true } });
    });
};
