import uuid from 'uuid';

import * as Constants from '../constants';
import { CATEGORIES, ENDPOINT_NAMES } from '../analytics';
import ApiUtil from '../../util/ApiUtil';
import { openAnnotationDeleteModal } from '../../reader/PdfViewer/PdfViewerActions';

export const selectAnnotation = (annotationId) => ({
  type: Constants.SELECT_ANNOTATION,
  payload: {
    annotationId
  },
  meta: {
    analytics: {
      category: CATEGORIES.VIEW_DOCUMENT_PAGE,
      action: 'select-annotation'
    }
  }
});

export const startPlacingAnnotation = (interactionType) => ({
  type: Constants.START_PLACING_ANNOTATION,
  meta: {
    analytics: {
      category: CATEGORIES.VIEW_DOCUMENT_PAGE,
      action: 'startplacing-annotation',
      label: interactionType
    }
  }
});

export const stopPlacingAnnotation = (interactionType) => ({
  type: Constants.STOP_PLACING_ANNOTATION,
  meta: {
    analytics: {
      category: CATEGORIES.VIEW_DOCUMENT_PAGE,
      action: 'stop-placing-annotation',
      label: interactionType
    }
  }
});

export const placeAnnotation = (pageNumber, coordinates, documentId) => ({
  type: Constants.PLACE_ANNOTATION,
  payload: {
    page: pageNumber,
    x: coordinates.xPosition,
    y: coordinates.yPosition,
    documentId
  }
});

export const showPlaceAnnotationIcon = (pageIndex, pageCoords) => ({
  type: Constants.SHOW_PLACE_ANNOTATION_ICON,
  payload: {
    pageIndex,
    pageCoords
  }
});

export const deleteAnnotation = (docId, annotationId) =>
  (dispatch) => {
    dispatch({
      type: Constants.REQUEST_DELETE_ANNOTATION,
      payload: {
        annotationId
      },
      meta: {
        analytics: {
          category: CATEGORIES.VIEW_DOCUMENT_PAGE,
          action: 'request-delete-annotation'
        }
      }
    });

    ApiUtil.delete(`/document/${docId}/annotation/${annotationId}`, {}, ENDPOINT_NAMES.ANNOTATION).
      then(
        () => dispatch({
          type: Constants.REQUEST_DELETE_ANNOTATION_SUCCESS,
          payload: {
            annotationId
          }
        }),
        () => dispatch({
          type: Constants.REQUEST_DELETE_ANNOTATION_FAILURE,
          payload: {
            annotationId
          }
        })
      );
  };

export const requestMoveAnnotation = (annotation) => (dispatch) => {
  dispatch({
    type: Constants.REQUEST_MOVE_ANNOTATION,
    payload: {
      annotation
    },
    meta: {
      analytics: {
        category: CATEGORIES.VIEW_DOCUMENT_PAGE,
        action: 'request-move-annotation'
      }
    }
  });

  const data = ApiUtil.convertToSnakeCase({ annotation });

  ApiUtil.patch(`/document/${annotation.documentId}/annotation/${annotation.id}`, { data }, ENDPOINT_NAMES.ANNOTATION).
    then(
      () => dispatch({
        type: Constants.REQUEST_MOVE_ANNOTATION_SUCCESS,
        payload: {
          annotationId: annotation.id
        }
      }),
      () => dispatch({
        type: Constants.REQUEST_MOVE_ANNOTATION_FAILURE,
        payload: {
          annotationId: annotation.id
        }
      })
    );
};

export const startEditAnnotation = (annotationId) => ({
  type: Constants.START_EDIT_ANNOTATION,
  payload: {
    annotationId
  },
  meta: {
    analytics: {
      category: CATEGORIES.VIEW_DOCUMENT_PAGE,
      action: 'start-edit-annotation'
    }
  }
});

export const cancelEditAnnotation = (annotationId) => ({
  type: Constants.CANCEL_EDIT_ANNOTATION,
  payload: {
    annotationId
  },
  meta: {
    analytics: {
      category: CATEGORIES.VIEW_DOCUMENT_PAGE,
      action: 'cancel-edit-annotation'
    }
  }
});

export const updateAnnotationContent = (content, annotationId) => ({
  type: Constants.UPDATE_ANNOTATION_CONTENT,
  payload: {
    annotationId,
    content
  },
  meta: {
    analytics: {
      category: CATEGORIES.VIEW_DOCUMENT_PAGE,
      action: 'edit-annotation-content-locally',
      debounceMs: 500
    }
  }
});

export const updateNewAnnotationContent = (content) => ({
  type: Constants.UPDATE_NEW_ANNOTATION_CONTENT,
  payload: {
    content
  }
});

export const requestEditAnnotation = (annotation) => (dispatch) => {
  // If the user removed all text content in the annotation (or if only whitespace characters remain),
  // ask the user if they're intending to delete it.
  if (!annotation.comment.trim()) {
    dispatch(openAnnotationDeleteModal(annotation.id, 'open-by-deleting-all-annotation-content'));

    return;
  }

  dispatch({
    type: Constants.REQUEST_EDIT_ANNOTATION,
    payload: {
      annotationId: annotation.id
    },
    meta: {
      analytics: {
        category: CATEGORIES.VIEW_DOCUMENT_PAGE,
        action: 'request-edit-annotation'
      }
    }
  });

  const data = ApiUtil.convertToSnakeCase({ annotation });

  ApiUtil.patch(`/document/${annotation.documentId}/annotation/${annotation.id}`, { data }, ENDPOINT_NAMES.ANNOTATION).
    then(
      () => dispatch({
        type: Constants.REQUEST_EDIT_ANNOTATION_SUCCESS,
        payload: {
          annotationId: annotation.id
        }
      }),
      (response) => {
        const responseObject = JSON.parse(response.response.text);

        dispatch({
          type: Constants.REQUEST_EDIT_ANNOTATION_FAILURE,
          payload: {
            annotationId: annotation.id,
            errorMessage: responseObject.errors[0].detail
          }
        });
      }
    );
};

export const createAnnotation = (annotation) => (dispatch) => {
  const temporaryId = uuid.v4();

  dispatch({
    type: Constants.REQUEST_CREATE_ANNOTATION,
    payload: {
      annotation: {
        ...annotation,
        id: temporaryId
      }
    }
  });

  const data = ApiUtil.convertToSnakeCase({ annotation });

  ApiUtil.post(`/document/${annotation.documentId}/annotation`, { data }, ENDPOINT_NAMES.ANNOTATION).
    then(
      (response) => {
        const responseObject = JSON.parse(response.text);

        dispatch({
          type: Constants.REQUEST_CREATE_ANNOTATION_SUCCESS,
          payload: {
            annotation: {
              ...annotation,
              ...responseObject
            },
            annotationTemporaryId: temporaryId
          }
        });
      },
      (response) => {
        const responseObject = JSON.parse(response.response.text);

        dispatch({
          type: Constants.REQUEST_CREATE_ANNOTATION_FAILURE,
          payload: {
            annotationTemporaryId: temporaryId,
            errorMessage: responseObject.errors[0].detail
          }
        });
      }
    );
};
