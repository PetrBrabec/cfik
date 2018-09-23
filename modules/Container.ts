import { setupPage, normalize } from "csstips";
import "bootstrap/dist/css/bootstrap.min.css";

import { IRouteOptions, Route, ITopRouteOptions } from "./Route";

interface IContainerOptions {
    name: string;
    machineName: string;

    entryElementId?: string;

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

    public entryElementId: string = "app";
    public machineName: string;
    public name: string;
    public route: IRouteOptions;
}

export class Container {
    public options: ContainerOptions;

    public route: Route;

    public constructor(options: IContainerOptions) {
        this.options = new ContainerOptions(options);

        const topRouteOptions = Object.assign<IRouteOptions, ITopRouteOptions>(
            this.options.route,
            {
                container: this
            }
        );

        this.route = new Route(topRouteOptions);

        this.init();
    }

    public async init() {
        // styles
        normalize();
        setupPage(`#${this.options.entryElementId}`);

        // render
        this.route.render();
    }
}