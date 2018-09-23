import * as React from "react";
import { Route } from "../Route";
import { NavigationPosition } from "../Layout/NavigationPosition";

export interface IModalOptions {
    navigationPosition: NavigationPosition,
    machineName: string,
    title: string,
    component: ModalConstructor
}

export interface ModalConstructor {
    new(props: Readonly<ModalProps>): Modal;
}

interface ModalProps {
    route: Route,
}

export class Modal extends React.Component<ModalProps, {}> {
    public constructor(props: Readonly<ModalProps>) {
        super(props);
    }
}