import * as React from "react";
import { Route } from "./Route";
import { Role } from "./Role";

export interface PageConstructor<TProps = {}, TState = {}, TRole = Role> {
    new(props: Readonly<TProps & PageProps<TRole>>): Page<TProps, TState>;
}

export interface PageProps<TRole> {
    route: Route<TRole>;
}

export class Page<TProps = {}, TState = {}, TRole = Role> extends React.Component<TProps & PageProps<TRole>, TState> {
    public constructor(props: Readonly<TProps & PageProps<TRole>>) {
        super(props);
    }
}