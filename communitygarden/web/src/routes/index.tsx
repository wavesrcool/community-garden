import { BrowserRouter, Route, Switch } from "react-router-dom"
import { PSignUpView } from "../components/signup/public/ui/PSignUpView";


export const Router = () => (
    <BrowserRouter>
        <Switch>
            <Route exact={true} path="/bt" component={PSignUpView} />
        </Switch>
    </BrowserRouter>
);