import * as React from "react";
import { Route } from "./Route";

export interface PageConstructor {
    new (props: Readonly<PageProps>, route: Route): Page;
}

interface PageProps
{
    
}

export class Page extends React.Component<PageProps, {}> {
    public constructor(props: Readonly<PageProps>, route: Route)
    {
        super(props);
        
        this.route = route;
    }

    public route: Readonly<Route>;
}