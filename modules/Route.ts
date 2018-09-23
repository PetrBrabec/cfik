import * as React from "react";
import * as ReactDOM from "react-dom";

import { PageConstructor } from "./Page";
import { LayoutConstructor, Layout } from "./Layout";
import { Container } from "./Container";
import { IModalRouteOptions, ModalRoute } from "./ModalRoute";

type TMatch = () => Route | undefined;

export class RouteOptions implements IRouteOptions {
    public path: string;
    public title: string;
    public isExternal?: boolean;
    public layout?: LayoutConstructor | boolean;
    public component: PageConstructor;
    public match?: TMatch;
    public children?: Array<IRouteOptions>;
    public modals?: Array<IModalRouteOptions>;
    public notFound?: IRouteOptions;
    public container?: Container;
    public parent?: Route;
    public topRoute?: Route;

    public isTopRoute(): this is ITopRouteOptions {
        return this.container != undefined;
    }

    public isChildrenRoute(): this is IChildrenRouteOptions {
        return this.parent != undefined;
    }
}

export interface IRouteOptions {
    path: string;
    title: string;
    isExternal?: boolean;
    layout?: LayoutConstructor | boolean;
    component?: PageConstructor;
    match?: TMatch;
    children?: Array<IRouteOptions>;
    modals?: Array<IModalRouteOptions>;
    notFound?: IRouteOptions;
}

export interface ITopRouteOptions {
    container: Container;
}

export interface IChildrenRouteOptions {
    parent: Route;
    topRoute: Route;
}

export class Route {
    public constructor(options: (IRouteOptions & (IChildrenRouteOptions | ITopRouteOptions))) {
        const o = Object.assign(new RouteOptions(), options);

        this.render = this.render.bind(this);
        this.open = this.open.bind(this);
        this.replace = this.replace.bind(this);
        this.component = options.component;
        this.isExternal = options.isExternal;
        this.path = options.path;
        this.title = options.title;

        const getter = (key: keyof (IRouteOptions & IChildrenRouteOptions & ITopRouteOptions), value: any) => {
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

        const inherit = (key: keyof (IRouteOptions & IChildrenRouteOptions & ITopRouteOptions)) => {
            if (this.parent != undefined) {
                getter(key, this.parent[key]);
            }
        }

        if (o.isTopRoute()) {
            this.container = o.container;
            this.fullPath = "/" + this.path;
        }
        else if (o.isChildrenRoute()) {
            getter("parent", o.parent);
            inherit("topRoute");
            inherit("container");
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
        if (options.notFound == undefined) {
            inherit("notFound");
        }
        else {
            const notFound = options.notFound as IRouteOptions & IChildrenRouteOptions;
            notFound.parent = this;
            this.notFound = new Route(notFound);
        }

        if (options.match != undefined) {
            this.match = options.match;
        }

        // children
        if (options.children != undefined) {
            this.children = options.children.map(
                (child: IRouteOptions & IChildrenRouteOptions) => {
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
                    return new ModalRoute({
                        machineName: modal.machineName,
                        title: modal.title,
                        component: modal.component,
                        container: this.container,
                        topRoute: this.topRoute
                    });
                }
            )
        }
    }

    public container: Container;
    public title: string;
    public isExternal?: boolean;
    public layout?: LayoutConstructor;
    public component?: PageConstructor;
    public children?: Array<Route>;
    public modals?: Array<ModalRoute>;
    public notFound: Route;

    public get topRoute(): Route {
        return this;
    }

    public get parent(): undefined | Route {
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

    public match: TMatch = () => {
        const path = this.pathWithoutModal(this.pathFormatter(this.pathName));

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
    public matchModal(machineName: string): undefined | ModalRoute {
        if (this.modals != undefined) {
            for (const modal of this.modals) {
                if (modal.machineName == machineName) {
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

    public get openedModal(): undefined | ModalRoute {
        if (this.openedModalMachineName != undefined) {
            return this.topRoute.matchModal(this.openedModalMachineName);
        }
    }

    // render
    public render(): void {
        let routeToRender = this.topRoute.match();

        if (routeToRender == undefined) {
            routeToRender = this.notFound;
        }

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