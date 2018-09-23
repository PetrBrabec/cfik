import * as React from "react";
import * as ReactDOM from "react-dom";
import { action, computed } from "mobx";

import { PageConstructor } from "./Page";
import { LayoutConstructor, Layout } from "./Layout/Layout";
import { Container } from "./Container";
import { IModalOptions } from "./Modal/Modal";

type TMatch = (path: string) => Route | undefined;

export class RouteOptions implements IRouteOptions {
    public path: string;
    public title: string;
    public isExternal?: boolean;
    public layout?: LayoutConstructor | boolean;
    public component: PageConstructor;
    public match?: TMatch;
    public children?: Array<IRouteOptions>;
    public modals?: Array<IModalOptions>;
    public notFound?: IRouteOptions;
    public container?: Container;
    public parent?: Route;
    public top?: Route;

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
    modals?: Array<IModalOptions>;
    notFound?: IRouteOptions;
}

export interface ITopRouteOptions {
    container: Container;
    component: PageConstructor;
}

export interface IChildrenRouteOptions {
    parent: Route;
    top: Route;
}

const MODAL_URI_STRING = "modal"

export class Route {
    public constructor(options: (IRouteOptions & (IChildrenRouteOptions | ITopRouteOptions))) {
        const o = Object.assign(new RouteOptions(), options);

        this.render = this.render.bind(this);
        this.closeModal = this.closeModal.bind(this);
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
            inherit("top");
            inherit("container");
            this.fullPath = this.parent.fullPath + this.path;
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
                    child.top = this.top;

                    return new Route(child);
                }
            );
        }

        // modals
        if (options.modals != undefined) {
            this.modals = options.modals.map(
                (modal) => {
                    return modal;
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
    public modals?: Array<IModalOptions>;
    public notFound: Route;

    public get top(): Route {
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
        let path = originalPath.replace("#/", "");
        const modalIndex = path.indexOf(`/${MODAL_URI_STRING}`);

        if (modalIndex > -1) {
            path = path.slice(0, modalIndex);
        }

        return path;
    }

    public match: TMatch = (originalPath: string) => {
        const path = this.pathWithoutModal(originalPath);
        const pathParts = path.split("/");
        const childPath = pathParts[0];

        // it's this one
        if (this.path == childPath) {
            return this;
        }
        // some of children?
        else if (this.children != undefined) {
            for (const child of this.children) {
                if (child.path == childPath) {
                    // if no child part of url exist, this is our result
                    if (pathParts.length == 1) {
                        return child;
                    }
                    else {
                        return child.match(pathParts.slice(1).join("/"));
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
        return "#" + path;
    }

    // navigation
    public get active(): boolean {
        return this.fullPath == this.pathWithoutModal(this.pathName);
    }

    public get location(): Location {
        return location;
    }

    public get pathName(): string {
        return this.location.href.slice(this.location.origin.length).replace("/#", "");
    }

    public _open(path: string): void {
        this.location.href = path;
    }

    public open(path?: string): boolean {
        if (path == undefined) {
            if (this.isExternal) {
                this.location.href = this.path;
                return true;
            }

            this._open(this.formattedFullPath);
        }
        else {
            this._open(this.pathFormatter(path));
        }

        this.render();

        return false;
    }

    public _replace(path: string): void {
        this.location.replace(path);
    }

    public replace(path?: string): boolean {
        if (path == undefined) {
            if (this.isExternal) {
                this.location.href = this.path;
                return true;
            }

            this._replace(this.formattedFullPath);
        }
        else {
            this._replace(this.pathFormatter(path));
        }

        this.render();

        return false;
    }

    // modals
    public matchModal(machineName: string): undefined | IModalOptions {
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

    private get openedModalIndexOfMachineNameInPath(): number {
        return this.pathName.indexOf(`/${MODAL_URI_STRING}`);
    }

    public get openedModal(): undefined | IModalOptions {
        if (this.openedModalIndexOfMachineNameInPath > -1) {
            return this.top.matchModal(this.pathName.slice(this.openedModalIndexOfMachineNameInPath + 2 + MODAL_URI_STRING.length));
        }
    }

    public closeModal(): void {
        this.open();
    }

    // render
    public render(): void {
        let routeToRender = this.top.match(location.hash);

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