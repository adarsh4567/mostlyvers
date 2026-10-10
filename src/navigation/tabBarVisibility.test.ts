import { shouldShowFloatingTabBar } from './tabBarVisibility';

const tabState = (tabName: string, screenName?: string) => ({
  index: 0,
  routes: [
    {
      name: tabName,
      ...(screenName
        ? {
            state: {
              index: 1,
              routes: [{ name: `${tabName}Root` }, { name: screenName }],
            },
          }
        : {}),
    },
  ],
});

describe('floating tab bar visibility', () => {
  it('stays visible on a tab root screen', () => {
    expect(shouldShowFloatingTabBar(tabState('LibraryStack'))).toBe(true);
    expect(
      shouldShowFloatingTabBar({
        index: 0,
        routes: [
          {
            name: 'LibraryStack',
            state: { index: 0, routes: [{ name: 'LibraryScreen' }] },
          },
        ],
      }),
    ).toBe(true);
  });

  it('hides on book details so it cannot cover the claim/read action', () => {
    expect(shouldShowFloatingTabBar(tabState('LibraryStack', 'BookDetailsScreen'))).toBe(false);
  });

  it('hides while reading so it cannot cover reader controls', () => {
    expect(shouldShowFloatingTabBar(tabState('ReadingStack', 'BookReaderScreen'))).toBe(false);
  });

  it('hides on account detail screens', () => {
    expect(shouldShowFloatingTabBar(tabState('AccountStack', 'ProfileScreen'))).toBe(false);
  });
});
