import { navigationGroups, routeMap, defaultRoute } from "./data/navigation.js";

export const AppArchitecture = {
  defaultRoute,
  navigationGroups,
  routeMap,
  shell: {
    sidebar: "components/Sidebar.js",
    header: "components/Header.js"
  }
};
