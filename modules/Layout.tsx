import * as React from "react";
import { style } from "typestyle";
import * as csstips from "csstips";
import { Helmet } from "react-helmet";
import { observer } from "mobx-react";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from "reactstrap";

import { RouteNavItem } from "./RouteNavItem";

import { Route } from "./Route";

interface ILayoutProps {
    className?: string;
    route: Route;
}

// TODO vygenerovat menu podle routes souboru

@observer
export class Layout extends React.Component<ILayoutProps> {
    public render() {
        return (
            <main className={(this.props.className != undefined ? this.props.className + " " : "") + style(csstips.fillParent)}>
                <Navbar color="light" light expand="md">
                    <NavbarBrand href={this.props.route.formattedPath} onClick={() => route.open()}>{APPLICATION_CONFIGURATION.name}</NavbarBrand>
                    <NavbarToggler onClick={this.props.pageStore.toggleNavigation} />
                    <Collapse isOpen={this.props.pageStore.isNavigationOpened} navbar>
                        <Nav className={"ml-auto"} pills>
                            {
                                route.children != undefined
                                ? route.children.map((route, i) => <RouteNavItem key={`mainRouteNavItem${i}`} route={route}/>)
                                : null
                            }
                            
                            <NavItem>
                                <NavLink href="csv.php">stary csv konvertor</NavLink>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>

                <Helmet
                    title={this.props.pageStore.title}
                />

                {this.props.children}
            </main>
        );
    }
}