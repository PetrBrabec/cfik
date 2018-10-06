import * as React from "react";
import { Route } from "./Route";

export interface PageConstructor<TProps, TState> {
    new(props: Readonly<TProps & PageProps>): Page<TProps, TState>;
}

export interface PageProps {
    route: Route
}

export class Page<TProps, TState = {}> extends React.Component<TProps & PageProps, TState> {
    public constructor(props: Readonly<TProps & PageProps>) {
        super(props);
    }
}