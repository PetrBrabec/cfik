import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { ModalRoute } from "./ModalRoute";

export interface ModalConstructor {
    new(props: Readonly<ModalProps>): Modal;
}

interface ModalProps {
    modalRoute: ModalRoute,
}

interface ModalState {
    isOpened: boolean,
}

@observer
export class Modal extends React.Component<ModalProps, ModalState> {
    public constructor(props: Readonly<ModalProps>) {
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