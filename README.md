# CFIK

Framework for (yet) basic websites.

Features:  
1. Routing (hash and classic)
2. Simple Pages and Modals structure setting
3. Generated Navigation

## Example usage

```
import { Container } from "cfik";

import { HomePage } from "./pages/Home/HomePage";
import { CsvPage } from "./pages/csv/CsvPage";
import { MapPage } from "./pages/Map/MapPage";
import { NotFoundPage } from "./pages/NotFound/NotFoundPage";
import { UnauthorizedPage } from "./pages/Unauthorized/UnauthorizedPage";

import { LoginModal } from "./modals/Login/LoginModal";

enum Role {
    Admin,
    Anonymous
}

interface User {
    email: string;
    roles: Array<Role>;
}

let user: undefined | User = {
    email: "foo@bar.com",
    roles: [Role.Admin]
}

export const container = new Container({
    machineName: "dashboard",
    name: "Dashboard",
    route: {
        path: "",
        title: "Home",
        component: HomePage,
        layout: true,
        children: [
            {
                path: "map",
                title: "Map",
                component: MapPage,
                roles: [Role.Admin]
            },
            {
                path: "xml-to-csv",
                title: "XML to CSV",
                component: CsvPage,
            },
            {
                path: "https://foo.bar.com/csv.php",
                isExternal: true,
                title: "Old CSV tool"
            }
        ],
        modals: [
            {
                roles: [Role.Anonymous],
                machineName: "login",
                title: "Login",
                component: LoginModal
            }
        ],
        notFoundRoute: {
            path: "not-found",
            title: "Not found",
            component: NotFoundPage
        },
        unauthorizedRoute: {
            path: "forbidden",
            title: "Forbidden",
            component: UnauthorizedPage
        },
    },
    hasRole: (roles) => roles.some((r) => user != undefined ? user.roles.indexOf(r) > -1 : r == Role.Anonymous),
    isSignedIn: () => { return user == undefined; },
    signout: async () => { user = undefined; }
});
```

## Installation

```
npm install cfik
```

## Authors

* **Petr Brabec** - *Initial work* - [PetrBrabec](https://github.com/PetrBrabec)