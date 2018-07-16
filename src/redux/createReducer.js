import isNil from 'lodash/isNil';
import isObject from 'lodash/isObject';
import has from 'lodash/has';

export default (initialState, handlers) => {
  if (isNil(initialState)) {
    throw new Error('Initial state is required');
  }

  if (isNil(handlers) || !isObject(handlers)) {
    throw new Error('Handlers must be an object');
  }

  return (state = initialState, action) => {
    if (isNil(action) || !has(action, 'type')) {
      return state;
    }

    const handler = handlers[action.type];
    let newState = isNil(handler) ? state : handler(state, action);
    if (!action.type.endsWith('_FAIL')) {
      delete newState.error;
    }
    return newState;
  }
}

