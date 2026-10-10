type NavigationStateLike = {
  index?: number;
  routes: Array<{
    name: string;
    state?: NavigationStateLike;
  }>;
};

const ROOT_SCREEN_BY_TAB: Record<string, string> = {
  HomeStack: 'HomeScreen',
  LibraryStack: 'LibraryScreen',
  ReadingStack: 'ReadingScreen',
  LatestStack: 'LatestScreen',
  UpcomingStack: 'UpcomingScreen',
  QRStack: 'QRScreen',
  AccountStack: 'AccountScreen',
};

/**
 * The floating menu belongs on each tab's landing screen only. Nested screens
 * provide their own actions and navigation; keeping the menu mounted there can
 * cover those controls because it is absolutely positioned.
 */
export const shouldShowFloatingTabBar = (state: NavigationStateLike): boolean => {
  const activeTab = state.routes[state.index ?? 0];
  if (!activeTab?.state) return true;

  const nestedState = activeTab.state;
  const activeScreen = nestedState.routes[nestedState.index ?? 0];
  return activeScreen?.name === ROOT_SCREEN_BY_TAB[activeTab.name];
};
