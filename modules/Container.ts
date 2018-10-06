import { Container as InvContainer } from "inversify";
import { setupPage, normalize } from "csstips";
import "bootstrap/dist/css/bootstrap.min.css";

import { IRouteOptions, Route, ITopRouteOptions } from "./Route";
import { Role } from "./Role";
import { User } from "./User";

interface IContainerOptions<TRole> extends ContainerOptions<TRole> { }

class ContainerOptions<TRole> implements IContainerOptions<TRole> {
    public constructor(options: IContainerOptions<TRole>) {
        for (const key in options) {
            if (options[key] != undefined) {
                this[key] = options[key]
            }
        }
    }

    public name: string;
    public machineName?: string;

    public hashPaths?: boolean = false;
    public entryElementId?: string = "app";
    public modalUriString?: string = "modal";

    public route?: IRouteOptions<TRole>;
    public user?: User<TRole>;
}

export class Container<TRole = Role> {
    public constructor(options: IContainerOptions<TRole>) {
        this.options = new ContainerOptions<TRole>(options);

        const topRouteOptions = Object.assign<IRouteOptions<TRole>, ITopRouteOptions<TRole>>(
            this.options.route,
            {
                title: this.options.route.title,
                container: this
            }
        );

        this.route = new Route<TRole>(topRouteOptions);

        this.init();
    }

    private _container: InvContainer;

    public async init(): Promise<void> {
        // styles
        normalize();
        setupPage(`#${this.options.entryElementId}`);

        // render
        this.route.render();
    }

    public options: ContainerOptions<TRole>;

    public route: Route<TRole>;

    public get user(): User<TRole> {
        return this.options.user != undefined ? this.options.user : new User({ roles: [] });
    }

    public set user(user: User<TRole>) {
        this.options.user = user;
    }
}