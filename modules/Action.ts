import { Container } from "./Container";

// just an action for the navigation
// used for example for logout button

export interface IActionOptions<TRole> {
    title: string;
    onClick: () => void;
    isVisible?: () => boolean;
    roles?: Array<TRole>;
}