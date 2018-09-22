import * as React from "react";
import * as ReactDOM from "react-dom";

import { PageConstructor } from "./Page";
import { computed } from "mobx";

type TMatch = (path: string) => Route | undefined;

export interface IRouteOptions
{
    path: string;
    title: string;

    layout: LayoutConstructor;
    component: PageConstructor;

    match?: TMatch;
    children?: Array<IRouteOptions>;
    notFound?: Route;
}

export interface IRouteOptions
{

}

export class Route
{
    public constructor(options: IRouteOptions)
    {
        for (const key in options)
        {
            if (options[key] != undefined) 
            {
                switch (key) {
                    case "children":
                        this.children = options.children.map(
                            (child) =>
                            {
                                const childInstance = new Route(child);

                                // define parent
                                Object.defineProperty(
                                    childInstance,
                                    "parent",
                                    {
                                        get: () => this
                                    }
                                )

                                // define top
                                Object.defineProperty(
                                    childInstance,
                                    "top",
                                    {
                                        get: () => this.top
                                    }
                                )

                                // define not found page
                                childInstance.notFound = this.notFound;

                                return childInstance;
                            }
                        );
                        break;
                
                    default:
                        this[key] = options[key];
                        break;
                }
            }
        }

        this.fullPath = this.parent == undefined ? this.path : (this.parent.fullPath + "/" + this.path);

        this.render = this.render.bind(this);
    }

    public title: string;
    public component: PageConstructor;

    public children?: Array<Route>;

    public notFound: Route;

    public get top(): Route
    {
        return this;
    }

    public get parent(): undefined | Route
    {
        return undefined;
    }

    public get parentsCount(): number
    {
        let count = 0;
        for (let parent = this.parent; parent != undefined; parent = parent.parent)
        {
            count++;
        }
        return count;
    }

    public match: TMatch = (originalPath: string) =>
    {
        const path = originalPath.replace("/#/", "").replace("#/", "");
        const pathParts = path.split("/");
        const childPath = pathParts[0];

        // it's this one
        if (this.path == childPath)
        {
            return this;
        }
        // some of children?
        else if (this.children != undefined)
        {
            for (const child of this.children)
            {
                if (child.path == childPath)
                {
                    // if no child part of url exist, this is our result
                    if (pathParts.length == 1)
                    {
                        return child;
                    }
                    else
                    {
                        return child.match(pathParts.slice(1).join("/"));
                    }
                }
            }
        }
    };

    // path
    
    public path: string;

    public fullPath: string;

    public get formattedPath(): string
    {
        return Route.pathFormatter(this.path);
    }

    public get formattedFullPath(): string
    {
        return Route.pathFormatter(this.fullPath);
    }

    public static pathFormatter(path: string): string
    {
        return "/#/" + path;
    }

    public static getPathFromHash(hash: string): string
    {
        return hash.replace("/#/", "").replace("#/", "");
    }

    public static get locationPath(): string
    {
        return this.getPathFromHash(location.hash);
    }

    // navigation

    @computed
    public get active(): boolean
    {
        return this.fullPath == Route.locationPath;
    }

    public open(path?: string): false
    {
        location.href = Route.pathFormatter(path != undefined ? path : this.formattedPath)
        this.render();
        return false;
    }

    public replace(path?: string): false
    {
        location.replace(Route.pathFormatter(path != undefined ? path : this.formattedPath));
        this.render();
        return false;
    }

    // render

    public entryElementId;

    public init(entryElementId: string): void
    {
        this.entryElementId = entryElementId;
        this.render();
    }

    public render(): void
    {
        let routeToRender = this.match(location.hash);
        
        if (routeToRender == undefined)
        {
            routeToRender = this.notFound;
        }

        ReactDOM.render(
            React.createElement(
                routeToRender.component,
                {
                    
                }
            ),
            document.getElementById(this.entryElementId)
        );
    }
}