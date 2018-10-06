import * as React from "react";
import * as ReactDOM from "react-dom";

import { PageConstructor } from "./Page";
import { LayoutConstructor, Layout } from "./Layout";
import { Container } from "./Container";
import { IModalRouteOptions, ModalRoute } from "./ModalRoute";
import { Role } from "./Role";
import { IActionOptions } from "./Action";

type TMatch<TRole> = () => Route<TRole> | undefined;

export class RouteOptions<TRole> implements TAllRouteOptions<TRole> {
    public title: string;
    public path?: string;

    public layout?: LayoutConstructor<TRole> | boolean;
    public component?: PageConstructor;

    public match?: TMatch<TRole>;

    public children?: Array<IChildrenRouteOptions<TRole>>;
    public notFoundRoute?: IChildrenRouteOptions<TRole>;
    public unauthorizedRoute?: IChildrenRouteOptions<TRole>;
    public modals?: Array<IModalRouteOptions<TRole>>;
    public actions?: Array<IActionOptions<TRole>>;

    public topRoute?: Route<TRole>;

    // top route
    public container?: Container<TRole>;

    // children route
    public parent?: Route<TRole>;
    public roles?: Array<TRole>;
    public isExternal?: boolean;

    public isTopRoute(): this is ITopRouteOptions<TRole> {
        return this.container != undefined;
    }

    public isChildrenRoute(): this is IChildrenRouteOptions<TRole> {
        return this.parent != undefined;
    }
}

export type TAllRouteOptions<TRole> = ITopRouteOptions<TRole> & IChildrenRouteOptions<TRole>;

export interface IRouteOptions<TRole> {
    title: string;
    path?: string;

    layout?: LayoutConstructor<TRole> | boolean;
    component?: PageConstructor;

    match?: TMatch<TRole>;

    children?: Array<IChildrenRouteOptions<TRole>>;
    notFoundRoute?: IChildrenRouteOptions<TRole>;
    unauthorizedRoute?: IChildrenRouteOptions<TRole>;
    modals?: Array<IModalRouteOptions<TRole>>;
    actions?: Array<IActionOptions<TRole>>;

    topRoute?: Route<TRole>;
}

export interface ITopRouteOptions<TRole> extends IRouteOptions<TRole> {
    container?: Container<TRole>;
}

export interface IChildrenRouteOptions<TRole> extends IRouteOptions<TRole> {
    parent?: Route<TRole>;
    roles?: Array<TRole>;
    isExternal?: boolean;
}

export class Route<TRole = Role> {
    public constructor(_options: (IRouteOptions<TRole> & (IChildrenRouteOptions<TRole> | ITopRouteOptions<TRole>))) {
        const options = Object.assign(new RouteOptions<TRole>(), _options);

        this.title = options.title;
        this.path = options.path != undefined ? options.path : "";

        this.component = options.component;
        this.actions = options.actions;

        const getter = (key: keyof (IRouteOptions<TRole> & IChildrenRouteOptions<TRole> & ITopRouteOptions<TRole>), value: any) => {
            if (value != undefined) {
                Object.defineProperty(
                    this,
                    key,
                    {
                        get: () => value
                    }
                )
            }
        }

        const inherit = (key: keyof (IRouteOptions<TRole> & IChildrenRouteOptions<TRole> & ITopRouteOptions<TRole>)) => {
            if (this.parent != undefined) {
                getter(key, this.parent[key]);
            }
        }

        if (options.isTopRoute()) {
            this.container = options.container;
            this.fullPath = "/" + this.path;
        }

        if (options.isChildrenRoute()) {
            getter("parent", options.parent);
            inherit("topRoute");
            inherit("container");
            this.isExternal = options.isExternal;
            this.roles = options.roles;
            this.fullPath = this.parent.fullPath + (this.parent.fullPath == "/" ? "" : "/") + this.path;
        }

        // layout
        if (options.layout == undefined) {
            inherit("layout");
        }
        else if (options.layout === true) {
            this.layout = Layout;
        }
        else if (options.layout !== false) {
            this.layout = options.layout;
        }

        // not found
        if (options.notFoundRoute == undefined) {
            inherit("notFoundRoute");
        }
        else {
            const notFoundRoute = options.notFoundRoute as IRouteOptions<TRole> & IChildrenRouteOptions<TRole>;
            notFoundRoute.parent = this;
            this.notFoundRoute = new Route(notFoundRoute);
        }

        // unauthorized
        if (options.unauthorizedRoute == undefined) {
            inherit("unauthorizedRoute");
        }
        else {
            const unauthorizedRoute = options.unauthorizedRoute as IRouteOptions<TRole> & IChildrenRouteOptions<TRole>;
            unauthorizedRoute.parent = this;
            this.unauthorizedRoute = new Route(unauthorizedRoute);
        }

        // match
        if (options.match != undefined) {
            this._match = options.match;
        }

        // children
        if (options.children != undefined) {
            this.children = options.children.map(
                (child: IRouteOptions<TRole> & IChildrenRouteOptions<TRole>) => {
                    child.parent = this;
                    child.topRoute = this.topRoute;

                    return new Route(child);
                }
            );
        }

        // modals
        if (options.modals != undefined) {
            this.modals = options.modals.map(
                (modal) => {
                    return new ModalRoute<TRole>({
                        machineName: modal.machineName,
                        title: modal.title,
                        component: modal.component,
                        container: this.container,
                        topRoute: this.topRoute,
                        roles: modal.roles,
                        isVisible: modal.isVisible
                    });
                }
            )
        }

        this.render = this.render.bind(this);
        this.open = this.open.bind(this);
        this.replace = this.replace.bind(this);
    }

    public container: Container<TRole>;
    public title: string;
    public isExternal?: boolean;
    public layout?: LayoutConstructor<TRole>;
    public component?: PageConstructor;
    public children?: Array<Route<TRole>>;
    public modals?: Array<ModalRoute<TRole>>;
    public actions?: Array<IActionOptions<TRole>>;
    public notFoundRoute: Route<TRole>;
    public unauthorizedRoute: Route<TRole>;
    public roles?: Array<TRole>;

    public get topRoute(): Route<TRole> {
        return this;
    }

    public get parent(): undefined | Route<TRole> {
        return undefined;
    }

    public get parentsCount(): number {
        let count = 0;
        for (let parent = this.parent; parent != undefined; parent = parent.parent) {
            count++;
        }
        return count;
    }

    public pathWithoutModal(originalPath: string): string {
        let path = originalPath;
        const modalIndex = path.indexOf(`/${this.container.options.modalUriString}/`);

        if (modalIndex > -1) {
            path = path.slice(0, modalIndex);
        }

        return path;
    }

    private _match?: TMatch<TRole>;

    public match: TMatch<TRole> = () => {
        if (this._match != undefined) {
            const result = this._match();
            if (result != undefined) {
                return result;
            }
        }

        let path = this.pathWithoutModal(this.pathFormatter(this.pathName));

        if (path == "") {
            path = "/";
        }

        // it's this one
        if (this.formattedFullPath == path) {
            return this;
        }
        // some of children?
        else if (this.children != undefined) {
            for (const child of this.children) {
                if (path.indexOf(child.formattedFullPath) == 0) {
                    // if no child part of url exist, this is our result
                    if (path.split("/").length == 2) {
                        return child;
                    }
                    else {
                        return child.match();
                    }
                }
            }
        }
    };

    // path
    public path: string;

    public fullPath: string;

    public get formattedPath(): string {
        return this.pathFormatter(this.path);
    }

    public get formattedFullPath(): string {
        return this.pathFormatter(this.fullPath);
    }

    public pathFormatter(path: string): string {
        if (this.container.options.hashPaths) {
            return "#" + path;
        }
        return path;
    }

    public pathDeformatter(path: string): string {
        if (this.container.options.hashPaths) {
            return path.replace("#/", "");
        }
        return path;
    }

    // navigation
    public get active(): boolean {
        if (this.isExternal) {
            return false;
        }

        return this.fullPath == this.pathWithoutModal(this.pathName);
    }

    public get location(): Location {
        return location;
    }

    public get pathName(): string {
        return this.pathDeformatter(this.location.href.slice(this.location.origin.length));
    }

    public open(event?: React.MouseEvent<any>): boolean {
        if (this.isExternal) {
            this.location.href = this.path;
            return true;
        }

        if (event != undefined) {
            event.preventDefault();
        }

        window.history.pushState("", "", this.formattedFullPath);

        this.render();

        return false;
    }

    public replace(event?: React.MouseEvent<any>): boolean {
        if (this.isExternal) {
            this.location.href = this.path;
            return true;
        }

        if (event != undefined) {
            event.preventDefault();
        }

        window.history.replaceState("", "", this.formattedFullPath);

        this.render();

        return false;
    }

    // modals
    public matchModal(machineName: string): undefined | ModalRoute<TRole> {
        if (this.modals != undefined) {
            for (const modal of this.modals) {
                if (modal.machineName == machineName && this.container.user.hasRoles(modal.roles)) {
                    return modal;
                }
                else {
                    if (this.children != undefined) {
                        for (const child of this.children) {
                            const modal = child.matchModal(machineName);
                            if (modal != undefined) {
                                return modal;
                            }
                        }
                    }
                }
            }
        }
    }

    public get indexOfModalUri(): number {
        return this.pathName.indexOf(`/${this.container.options.modalUriString}/`);
    }

    public get formatterPathNameWithoutModal(): string {
        if (this.indexOfModalUri > -1) {
            return this.pathFormatter(this.pathName.slice(0, this.indexOfModalUri));
        }
        return this.pathFormatter(this.pathName);
    }

    public get openedModalMachineName(): string | undefined {
        if (this.indexOfModalUri > -1) {
            return this.pathName.slice(this.indexOfModalUri + 2 + this.container.options.modalUriString.length);
        }
    }

    public get openedModal(): undefined | ModalRoute<TRole> {
        if (this.openedModalMachineName != undefined) {
            return this.topRoute.matchModal(this.openedModalMachineName);
        }
    }

    // render
    public render(): void {
        let routeToRender = this.topRoute.match();

        // not found
        if (routeToRender == undefined) {
            routeToRender = this.notFoundRoute;
        }

        // authorization
        if (!this.container.user.hasRoles(routeToRender.roles)) {
            routeToRender = this.unauthorizedRoute;
        }

        // no component defined
        if (routeToRender.component == undefined) {
            return;
        }

        ReactDOM.render(
            routeToRender.layout != undefined
                ? React.createElement(
                    routeToRender.layout,
                    {
                        route: routeToRender,
                        children: React.createElement(
                            routeToRender.component,
                            {
                                route: routeToRender
                            }
                        )
                    }
                )
                : React.createElement(
                    routeToRender.component
                ),
            document.getElementById(this.container.options.entryElementId)
        );
    }
}