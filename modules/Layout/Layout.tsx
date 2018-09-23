import * as React from "react";
import * as RS from "reactstrap";
import { style } from "typestyle";
import { observer } from "mobx-react";
import * as csstips from "csstips";
import { Helmet } from "react-helmet";

import { Route } from "../Route";

export interface LayoutConstructor {
    new(props: Readonly<ILayoutProps>, route: Route): Layout;
}

interface ILayoutProps {
    className?: string;
    route: Route;
}

interface ILayoutState {
    isNavigationOpened: boolean;
}
@observer
export class Layout extends React.Component<ILayoutProps, ILayoutState> {
    public state: ILayoutState = { isNavigationOpened: false };

    public toggleNavigation() {
        this.setState({ isNavigationOpened: !this.state.isNavigationOpened });
    }

    public render() {
        const route = this.props.route;

        return (
            <main className={(this.props.className != undefined ? this.props.className + " " : "") + style(csstips.fillParent)}>
                <RS.Navbar color="light" light expand="lg">
                    <RS.NavbarBrand href={route.top.formattedFullPath} onClick={() => route.top.open()}>{route.container.options.name}</RS.NavbarBrand>

                    <RS.NavbarToggler onClick={this.toggleNavigation.bind(this)} />

                    <RS.Collapse isOpen={this.state.isNavigationOpened} navbar>
                        <RS.Nav className={"ml-auto"} pills>
                            {
                                route.top.children != undefined
                                    ? route.top.children.map(
                                        (route, i) =>
                                            (
                                                <RS.NavItem
                                                    key={`mainRouteNavItem${i}`}
                                                >
                                                    <RS.NavLink
                                                        active={route.active}
                                                        href={route.formattedFullPath}
                                                        onClick={() => route.open()}
                                                    >{route.title}</RS.NavLink>
                                                </RS.NavItem>
                                            )
                                    )
                                    : null
                            }
                            {
                                route.top.modals != undefined
                                    ? route.top.modals.map(
                                        (modal, i) =>
                                            (
                                                <RS.NavItem
                                                    key={`mainRouteNavItemModal${i}`}
                                                >
                                                    <RS.NavLink
                                                        href={`${route.formattedFullPath}/modal/${modal.machineName}`}
                                                        onClick={() => route.open(`/${route.path}/modal/${modal.machineName}`)}
                                                    >{modal.title}</RS.NavLink>
                                                </RS.NavItem>
                                            )
                                    )
                                    : null
                            }
                        </RS.Nav>
                    </RS.Collapse>
                </RS.Navbar>

                <Helmet
                    title={route.title}
                />

                {
                    route.openedModal != undefined
                        ? <route.openedModal.component route={route} />
                        : null
                }

                {this.props.children}
            </main>
        );
    }
}