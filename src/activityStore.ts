import { writable, derived, get } from "svelte/store";
import { getActivities, Activity } from "./strava";
/* Activities fetched from strava...

TO DO...
-> Then... make this library cache results using localStorage!
-> Then... ???
-> profit!

*/

export interface ActivityFetcherParams {
  page: number;
  per_page: number;
  before: number;
  after: number;
  activities: Set<number>;
  complete: boolean;
}
export const per_page = writable(50);
const activitiesById = writable<Map<number, Activity>>(new Map());
const fetchersByDate = writable<Map<string, ActivityFetcherParams>>(new Map());
let now = new Date();
export const endDate = writable<Date | 0>(now);
export const startDate = writable<Date | 0>(
  new Date(now.getFullYear(), now.getMonth(), 1, 0)
); // first of the month
const fetching = writable(false);

function modifyFetcherForRedundancy(
  currentParams: ActivityFetcherParams,
  $fetchersByDate: Map<string, ActivityFetcherParams>
): ActivityFetcherParams {
  let { oldest, newest } = getBaseFetchInfo();
  let updates = {};
  if (newest) {
    // If we have base fetches already, let's assume they were in order from present to past...
    // Imagine we want to fetch 2/1 - 6/1  (after 1/1, before 6/1)
    if (currentParams.before > oldest || !currentParams.before) {
      // If we've already fetched 3/1 - 6/1, then we want to specify before 3/1...
      updates.before = oldest;
    }
    if (currentParams.after > oldest) {
      // And if we've already fetched 1/1 - 6/1, then we don't need to update at all...
      updates.complete = true; //
    }
  }
  if (!updates.complete) {
    // Check our complete time fetches...
    $fetchersByDate.forEach((fetcherParams, stampString) => {
      if (fetcherParams.complete) {
        let parsed = JSON.parse(stampString);
        let old = {
          before: parsed[1],
          after: parsed[0],
        };
        let current = {
          ...currentParams,
          ...updates,
        };
        // Let's just treat the "0" option for the future like a time in the future to make
        // all of our comparisons below just work...
        const theFuture = 2 * (new Date().getTime() / 1000);
        if (current.before == 0) {
          current.before = theFuture;
        }
        if (old.before == 0) {
          old.before = theFuture;
        }
        // We look for three types of overlap...
        if (old.after <= current.after && old.before >= current.before) {
          // 1. Contained
          // [less] old.after                                   old.before   [more]
          //               current.after      current.before
          console.log(
            "~F~ Opt 1 (contained) by",
            logF(old),
            logF(fetcherParams)
          );
          console.log(
            "~F: ",
            old.after,
            current.after,
            old.before,
            current.before
          );
          updates.complete = true;
        } else if (
          current.after <= old.after &&
          current.before <= old.before &&
          current.before > old.after // but not separated
        ) {
          // 2. Overlaps before
          // [less]                       old.after                       old.before   [more]
          //           current.after                 current.before
          //           [fetch this...     ]
          console.log("~F~ Opt 2", logF(old), logF(fetcherParams));
          updates.before = old.after;
        } else if (
          old.after <= current.after &&
          old.before < current.before &&
          old.before > current.after
        ) {
          // 1. Overlaps after
          // [less]        old.after                       old.before                [more]
          //                          current.after                    current.before
          //                                                   [fetch this...     ]
          console.log("~F~ Opt 3", logF(old), logF(fetcherParams));
          updates.after = old.before;
        }
        // Set timestamp back from theFuture to 0 so we make request to strava API for no limit
        // as opposed to a weird future limit...
        if (updates.before == theFuture) {
          updates.before = 0;
        }
      }
    });
  }
  /* if (Object.keys(updates).length) {
    console.log('~F~ Updating',logF(currentParams),'to',logF({...currentParams,...updates}),currentParams,updates);
  } */
  return {
    ...currentParams,
    ...updates,
  };

  function getBaseFetchInfo(): { oldest: number; newest: number } {
    let $activitiesById = get(activitiesById);
    let baseFetcher = $fetchersByDate.get(JSON.stringify([0, 0]));
    if (!baseFetcher || !baseFetcher.activities.size) {
      return { oldest: 0, newest: 0 };
    } else {
      let activities = Array.from(baseFetcher.activities);
      let last = activities[activities.length - 1];
      let first = activities[0];
      return {
        oldest: new Date($activitiesById.get(last).start_date).getTime() / 1000,
        newest:
          new Date($activitiesById.get(first).start_date).getTime() / 1000,
      };
    }
  }
}

function logF(fetcher: ActivityFetcherParams) {
  return `~F~${new Date(1000 * fetcher.after).toLocaleDateString()}-${new Date(
    1000 * fetcher.before
  ).toLocaleDateString()}`;
}
async function fetchActivities(
  fetcher: ActivityFetcherParams
): Promise<Set<number>> {
  if (!fetcher.complete) {
    let newActivities = await getActivities(
      fetcher.page,
      fetcher.per_page,
      fetcher.before,
      fetcher.after
    );
    //console.log('fetchActivities=>',logF(fetcher),fetcher,newActivities)
    activitiesById.update(($activitiesById) => {
      for (let activity of newActivities) {
        $activitiesById.set(activity.id, activity);
        fetcher.activities.add(activity.id);
      }
      return $activitiesById;
    });
    if (newActivities.length != fetcher.per_page) {
      //console.log('fetchActivities=>Complete',logF(fetcher),fetcher)
      fetcher.complete = true;
    }
    fetcher.page += 1;
  }
  return fetcher.activities;
}

async function prepopulateActivities(
  fetcher: ActivityFetcherParams,
  $activitiesById: Map<number, Activity>
) {
  if (!fetcher.before && !fetcher.after) {
    // then we are just a list of activities, so any activities we have count...
    $activitiesById.forEach((activity, key) => fetcher.activities.add(key));
  } else {
    $activitiesById.forEach((activity, key) => {
      let stamp = new Date(activity.start_date).getTime() / 1000;
      if (!fetcher.before || stamp < fetcher.before) {
        if (stamp > fetcher.after) {
          fetcher.activities.add(key);
        }
      }
    });
  }
  //console.log('~pp Prepopulated activity with:',Array.from(fetcher.activities), fetcher.activities.size)
}

export const activityFetcher = derived(
  [fetchersByDate, activitiesById, startDate, endDate],
  ([$fetchersByDate, $activitiesById, $startDate, $endDate]) => {
    let startStamp = ($startDate && $startDate.getTime() / 1000) || 0;
    let endStamp = ($endDate && $endDate.getTime() / 1000) || 0;
    if (endStamp && startStamp > endStamp) {
      console.log("~FF no go");
      return {
        broken: true,
        activities: () => [],
        fetchMore: async () => true,
        getFetcher: () => ({ complete: true }),
      };
    }
    let currentFetcher = {
      dateIndex: JSON.stringify([startStamp, endStamp]),
      getFetcher: () => {
        let fetchParams = $fetchersByDate.get(currentFetcher.dateIndex);
        if (!fetchParams) {
          fetchParams = {
            page: 1,
            per_page: get(per_page),
            after: startStamp,
            before: endStamp,
            complete: false,
            activities: new Set(),
          };
          console.log(
            "~FF Create new fetcher is:",
            logF(fetchParams),
            JSON.parse(JSON.stringify(fetchParams))
          );
          // Pre-populate fetcher...
          prepopulateActivities(fetchParams, $activitiesById);
          fetchParams = modifyFetcherForRedundancy(
            fetchParams,
            $fetchersByDate
          );
          console.log("~FF Modified params:", logF(fetchParams), fetchParams);
          fetchersByDate.update(($f) => {
            $f.set(currentFetcher.dateIndex, fetchParams);
            return $f;
          });
        }
        return fetchParams;
      },
      activities: () => {
        let fetcher = currentFetcher.getFetcher();
        prepopulateActivities(fetcher, $activitiesById); // in case we have new stuff since we were last fetching...
        let result = Array.from(fetcher.activities.keys(), (id) =>
          $activitiesById.get(id)
        );
        return result;
      },
      fetchMore: async () => {
        let fetcher = currentFetcher.getFetcher();
        if (!fetcher.complete) {
          await fetchActivities(fetcher);
          fetchersByDate.update(($f) => $f);
        }
        return fetcher.complete;
      },
      fetchAll: async () => {
        let fetcher = currentFetcher.getFetcher();
        while (!fetcher.complete) {
          await fetchActivities(fetcher);
          fetchersByDate.update(($f) => $f);
        }
        return fetcher;
      },
      reFetch: async () => {
        let fetchParams = {
          page: 1,
          per_page: get(per_page),
          after: startStamp,
          before: endStamp,
          complete: false,
          activities: new Set(),
        };
        fetchersByDate.update(($f) => {
          $f.set(currentFetcher.dateIndex, fetchParams);
          return $f;
        });
        await fetchActivities(fetcher);
        fetchersByDate.update(($f) => $f);
      },
    };
    return currentFetcher;
  }
);
