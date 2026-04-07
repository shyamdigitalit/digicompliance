let reduxStore;

export const injectStore = (store) => {
  reduxStore = store;
};

export const getStore = () => reduxStore;
