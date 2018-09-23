import { setupPage, normalize } from "csstips";
import "bootstrap/dist/css/bootstrap.min.css";

import { IRouteOptions, Route, ITopRouteOptions } from "./Route";
import { Role } from "./Roles";

interface IContainerOptions {
    name: string;
    machineName: string;

    hashPaths?: boolean;
    entryElementId?: string;
    modalUriString?: string;

    hasRole?: (roles: Array<Role>) => boolean;
    isSignedIn?: () => boolean;
    signout?: () => Promise<void>;

    route: IRouteOptions;
}

class ContainerOptions implements IContainerOptions {
    public constructor(options: IContainerOptions) {
        for (const key in options) {
            if (options[key] != undefined) {
                this[key] = options[key]
            }
        }
    }

    public name: string;
    public machineName: string;

    public hashPaths: boolean = false;
    public entryElementId: string = "app";
    public modalUriString: string = "modal";

    public hasRole?: (roles: Array<Role>) => boolean;
    public isSignedIn?: () => boolean;
    public signout?: () => Promise<void>;

    public route: IRouteOptions;
}

export class Container {
    public constructor(options: IContainerOptions) {
        this.options = new ContainerOptions(options);

        const topRouteOptions = Object.assign<IRouteOptions, ITopRouteOptions>(
            this.options.route,
            {
                container: this
            }
        );

        this.signout = this.signout.bind(this);

        this.route = new Route(topRouteOptions);

        this.init();
    }

    public async init(): Promise<void> {
        // styles
        normalize();
        setupPage(`#${this.options.entryElementId}`);

        // render
        this.route.render();
    }

    public options: ContainerOptions;

    public route: Route;

    // roles
    public isSignedIn(): boolean {
        if (this.options.isSignedIn != undefined) {
            return this.options.isSignedIn();
        }
        return true;
    }

    public async signout(): Promise<void> {
        if (this.options.signout != undefined) {
            await this.options.signout();
            this.route.render();
        }
    }

    public hasRole(roles?: Array<Role>): boolean {
        if (roles != undefined && this.options.hasRole != undefined) {
            return this.options.hasRole(roles);
        }
        return true;
    }
}