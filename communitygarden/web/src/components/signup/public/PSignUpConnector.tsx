import * as React from 'react'
import { PSignUpView } from './ui/PSignUpView';

export class RegisterConnector extends React.PureComponent {
    dummySubmit = async (values: any) => {
        console.log(values);
        return null;
    }

    render() {
        return (<PSignUpView submit={this.dummySubmit} />);
    }
}