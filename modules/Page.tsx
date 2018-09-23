import * as React from "react";
import { Route } from "./Route";

export interface PageConstructor {
    new(props: Readonly<PageProps>): Page;
}

interface PageProps {
    route: Route
}

export class Page extends React.Component<PageProps, {}> {
    public constructor(props: Readonly<PageProps>) {
        super(props);
    }
}