import * as React from "react";

import { Container } from "./Container";
import { ModalConstructor } from "./Modal";
import { Route } from "./Route";

export class ModalRouteOptions implements IModalRouteOptions {
    public machineName: string;
    public title: string;
    public component: ModalConstructor;
    public container: Container;
    public topRoute: Route;
}

export interface IModalRouteOptions {
    machineName: string;
    title: string;
    component: ModalConstructor;
}

export class ModalRoute {
    public constructor(options: ModalRouteOptions) {
        const o = Object.assign(new ModalRouteOptions(), options);

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);

        this.component = options.component;
        this.machineName = options.machineName;
        this.title = options.title;

        const getter = (key: keyof ModalRouteOptions, value: any) => {
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

        getter("topRoute", o.topRoute);
        getter("container", o.container);
    }

    public container: Container;
    public title: string;
    public machineName: string;
    public component: ModalConstructor;
    public topRoute: Route;

    public get modalPath(): string {
        return `/${this.container.options.modalUriString}/${this.machineName}`;
    }

    public get formattedFullPath(): string {
        return this.topRoute.formatterPathNameWithoutModal + this.modalPath;
    }

    // navigation
    public get active(): boolean {
        return this.topRoute.fullPath.indexOf(this.modalPath) > -1;
    }

    public open(event?: React.MouseEvent<any>): boolean {
        if (event != undefined) {
            event.preventDefault();
        }

        window.history.pushState("", "", this.formattedFullPath);

        this.topRoute.render();

        return false;
    }

    public replace(event?: React.MouseEvent<any>): boolean {
        if (event != undefined) {
            event.preventDefault();
        }

        window.history.replaceState("", "", this.formattedFullPath);

        this.topRoute.render();

        return false;
    }

    public close(): void {
        window.history.replaceState("", "", this.topRoute.formatterPathNameWithoutModal);
        this.topRoute.render();
    }
}