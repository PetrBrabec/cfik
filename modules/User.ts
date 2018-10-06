import { Role } from "./Role";

export interface IUserOptions<TRole> extends UserOptions<TRole> { }

export class UserOptions<TRole> implements IUserOptions<TRole> {
    public email?: string;
    public roles: Array<TRole> = [];
}


export class User<TRole = Role> {
    public constructor(options: IUserOptions<TRole>) {
        this.email = options.email;
        this.roles = options.roles;

        this.hasRoles = this.hasRoles.bind(this);
        this.isLoggedIn = this.isLoggedIn.bind(this);
        this.logout = this.logout.bind(this);
    }

    public email?: string;
    public roles: Array<TRole>;

    public hasRoles(roles?: Array<TRole>): boolean {
        return (
            roles != undefined
                ? (
                    (roles.length == 0 && this.roles.length == 0) ||
                    roles.some((r) => this.roles.indexOf(r) > -1)
                )
                : true
        );
    }

    public isLoggedIn(): boolean {
        return this.roles.length > 0;
    }

    public async logout(): Promise<void> {
        this.email = undefined;
        this.roles = [];
    }
}