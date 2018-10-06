import * as React from "react";
import * as RS from "reactstrap";
import { style } from "typestyle";
import { observer } from "mobx-react";
import * as csstips from "csstips";
import { Helmet } from "react-helmet";

import { Route } from "./Route";

export interface LayoutConstructor {
    new(props: Readonly<any>): Layout<any>;
}

interface ILayoutProps<TRole> {
    className?: string;
    route: Route<TRole>;
    children: JSX.Element;
}

interface ILayoutState {
    isNavigationOpened: boolean;
}
@observer
export class Layout<TRole = Role> extends React.Component<ILayoutProps<TRole>, ILayoutState> {
    public state: ILayoutState = { isNavigationOpened: false };

    public toggleNavigation() {
        this.setState({ isNavigationOpened: !this.state.isNavigationOpened });
    }

    public render() {
        const route = this.props.route;

        return (
            <main className={(this.props.className != undefined ? this.props.className + " " : "") + style({ marginTop: 56 })}>
                <RS.Navbar color="light" light expand="lg" fixed={"top"}>
                    <RS.NavbarBrand href={route.topRoute.formattedFullPath} onClick={route.topRoute.open}>{route.container.options.name}</RS.NavbarBrand>

                    <RS.NavbarToggler onClick={this.toggleNavigation.bind(this)} />

                    <RS.Collapse isOpen={this.state.isNavigationOpened} navbar>
                        <RS.Nav className={"ml-auto"} pills>
                            {
                                route.topRoute.children != undefined
                                    ? route.topRoute.children.reduce(
                                        (menuItems, route, i) => {
                                            if (!route.container.user.hasRoles(route.roles)) {
                                                return menuItems;
                                            }

                                            if (route.children != undefined && route.children.length > 0) {
                                                menuItems.push(
                                                    <RS.UncontrolledDropdown
                                                        key={`mainRouteNavItem${i}`}
                                                        nav
                                                        inNavbar
                                                    >
                                                        <RS.DropdownToggle nav caret>
                                                            {route.title}
                                                        </RS.DropdownToggle>

                                                        <RS.DropdownMenu right>
                                                            {
                                                                route.children.map(
                                                                    (childRoute, childIndex) =>
                                                                        (
                                                                            <RS.DropdownItem
                                                                                key={`routeNavItem${i}_${childIndex}`}
                                                                                active={childRoute.active}
                                                                                href={childRoute.formattedFullPath}
                                                                                onClick={childRoute.open}
                                                                            >
                                                                                {childRoute.title}
                                                                            </RS.DropdownItem>
                                                                        )
                                                                )
                                                            }
                                                        </RS.DropdownMenu>
                                                    </RS.UncontrolledDropdown>
                                                )
                                            }
                                            else {
                                                menuItems.push(
                                                    <RS.NavItem
                                                        key={`mainRouteNavItem${i}`}
                                                    >
                                                        <RS.NavLink
                                                            active={route.active}
                                                            href={route.formattedFullPath}
                                                            onClick={route.open}
                                                        >
                                                            {route.title}
                                                        </RS.NavLink>
                                                    </RS.NavItem>
                                                );
                                            }

                                            return menuItems;
                                        },
                                        new Array<JSX.Element>()
                                    )
                                    : null
                            }

                            {
                                route.topRoute.modals != undefined
                                    ? route.topRoute.modals.reduce(
                                        (menuItems, modal, i) => {
                                            if (!route.container.user.hasRoles(modal.roles)) {
                                                return menuItems;
                                            }

                                            menuItems.push(
                                                <RS.NavItem
                                                    key={`mainRouteNavItemModal${i}`}
                                                >
                                                    <RS.NavLink
                                                        href={modal.formattedFullPath}
                                                        onClick={modal.open}
                                                    >{modal.title}</RS.NavLink>
                                                </RS.NavItem>
                                            );

                                            return menuItems;
                                        },
                                        new Array<JSX.Element>()
                                    )
                                    : null
                            }

                            {
                                route.topRoute.actions != undefined
                                    ? route.topRoute.actions.reduce(
                                        (menuItems, action, i) => {
                                            if (!route.container.user.hasRoles(action.roles)) {
                                                return menuItems;
                                            }

                                            menuItems.push(
                                                <RS.Form
                                                    inline
                                                    key={`mainRouteNavItemAction${i}`}
                                                >
                                                    <RS.Button
                                                        onClick={action.onClick}
                                                    >{action.title}</RS.Button>
                                                </RS.Form>
                                            );

                                            return menuItems;
                                        },
                                        new Array<JSX.Element>()
                                    )
                                    : null
                            }
                        </RS.Nav>
                    </RS.Collapse>
                </RS.Navbar>

                {
                    route.openedModal != undefined
                        ? <route.openedModal.component modalRoute={route.openedModal} />
                        : null
                }

                {this.props.children}
            </main>
        );
    }
}