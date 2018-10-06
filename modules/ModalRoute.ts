import * as React from "react";

import { Container } from "./Container";
import { ModalConstructor } from "./Modal";
import { Route } from "./Route";
import { Role } from "./Role";

export interface IModalRouteOptions<TRole> extends ModalRouteOptions<TRole> { }

export class ModalRouteOptions<TRole> implements IModalRouteOptions<TRole> {
    public machineName: string;
    public title: string;
    public component: ModalConstructor<TRole>;
    public roles?: Array<TRole>;
    public isVisible?: () => boolean;

    public container?: Container<TRole>;
    public topRoute?: Route<TRole>;
}

export class ModalRoute<TRole = Role> {
    public constructor(options: ModalRouteOptions<TRole>) {
        const o = Object.assign(new ModalRouteOptions<TRole>(), options);

        this.close = this.close.bind(this);
        this.open = this.open.bind(this);

        this.component = options.component;
        this.machineName = options.machineName;
        this.title = options.title;
        this.roles = options.roles;

        this.isVisible = options.isVisible != undefined ? options.isVisible.bind(this) : () => true;

        const getter = (key: keyof ModalRouteOptions<TRole>, value: any) => {
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

    public machineName: string;
    public title: string;
    public component: ModalConstructor<TRole>;
    public roles?: Array<TRole>;
    public isVisible: () => boolean;

    public container: Container<TRole>;
    public topRoute: Route<TRole>;

    public get modalPath(): string {
        return `/${this.container.options.modalUriString}/${this.machineName}`;
    }

    public get formattedFullPath(): string {
        return (this.topRoute.formatterPathNameWithoutModal == "/" ? "" : this.topRoute.formatterPathNameWithoutModal) + this.modalPath;
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
        window.history.replaceState("", "", this.topRoute.formatterPathNameWithoutModal != "" ? this.topRoute.formatterPathNameWithoutModal : "/");
        this.topRoute.render();
    }
}