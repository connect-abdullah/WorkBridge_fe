/** Batch size for notifications page (initial + each “Load more”). */
export const NOTIFICATIONS_PAGE_SIZE = 8;

/** Wider fetch for nav unread badge (separate React Query cache from the page infinite list). */
export const NOTIFICATIONS_BADGE_LIST_QUERY = { offset: 0, limit: 50 } as const;
