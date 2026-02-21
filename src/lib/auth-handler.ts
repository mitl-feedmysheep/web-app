type ShowToastFunction = (message: string) => void;
type NavigateFunction = (path: string, replace?: boolean) => void;

const globalHandlers: {
  showToast?: ShowToastFunction;
  navigate?: NavigateFunction;
} = {};

export const setGlobalToast = (showToast: ShowToastFunction) => {
  globalHandlers.showToast = showToast;
};

export const setGlobalNavigate = (navigate: NavigateFunction) => {
  globalHandlers.navigate = navigate;
};
