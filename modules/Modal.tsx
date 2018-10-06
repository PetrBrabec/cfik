import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { ModalRoute } from "./ModalRoute";
import { Role } from "./Role";

export interface ModalConstructor<TRole> {
    new(props: Readonly<ModalProps<TRole>>): Modal<TRole>;
}

interface ModalProps<TRole> {
    modalRoute: ModalRoute<TRole>,
}

interface ModalState {
    isOpened: boolean,
}

@observer
export class Modal<TRole = Role> extends React.Component<ModalProps<TRole>, ModalState> {
    public constructor(props: Readonly<ModalProps<TRole>>) {
        super(props);
        this.close = this.close.bind(this);
    }

    public state: ModalState = { isOpened: true };

    @action
    public close(): void {
        this.setState({ isOpened: false });

        setTimeout(
            this.props.modalRoute.close.bind(this),
            500
        );
    }
}