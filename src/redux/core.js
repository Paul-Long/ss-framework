import createSagaMiddleware from 'redux-saga';
import createStore from './createStore';
import { reducerBuilder } from './reducerBuilder';
import { sagaBuilder } from './sagaBuilder';
import 'react-redux';

const cSagaMiddleware = createSagaMiddleware.default || createSagaMiddleware;

export default function create(createOpts = {}) {
  const { setupApp, onError: onErr, onEffect, onReducer } = createOpts;
  const app = {
    _models: [],
    model,
    models,
    reducerMiddleware,
    start,
  };

  return app;

  function model(model) {
    app._models.push(model);
  }

  function models(models) {
    app._models = [...app._models, ...models];
  }

  function reducerMiddleware(middleware) {
    app._reducerMiddleware = middleware;
  }

  function start(app) {
    const sagaMiddleware = cSagaMiddleware();
    const store = createStore({
      reducers: reducerBuilder(app._models,),
      initialState: {},
      sagaMiddleware,
    });
    app._store = store;

    store.runSaga = sagaMiddleware.run;
    const sagas = sagaBuilder(app._models);
    sagaMiddleware.run(sagas);
    setupApp(app);

  }
};
