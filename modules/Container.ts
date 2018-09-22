import { setupPage, normalize } from "csstips";
import "bootstrap/dist/css/bootstrap.min.css";

import { IRouteOptions } from "./Route";

interface IContainerOptions
{
    name: string;
    machineName: string;

    entryElementId?: string;

    route: IRouteOptions;
}

class ContainerOptions implements IContainerOptions
{
    public constructor(options: IContainerOptions)
    {
        for (const key in options)
        {
            if (options[key] != undefined) 
            { 
                this[key] = options[key] 
            }
        }
    }

    public entryElementId: string = "app";
    public machineName: string;
    public name: string;
    public route: IRouteOptions;
}

export class Container
{
    public ENTRY_ELEMENT_ID;

    public options: ContainerOptions;

    public constructor(options: IContainerOptions)
    {
        this.options = new ContainerOptions(options);
    }

    public init()
    {
        normalize();
        setupPage(`#${this.ENTRY_ELEMENT_ID}`);
    }
}