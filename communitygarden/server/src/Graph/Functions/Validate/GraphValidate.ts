import "reflect-metadata";
import ValidationError from 'yup/lib/ValidationError';
import { Account } from "../../Topology/Atlas/Account";
import { LoginInput, SignUpAccountInput, SignUpFarmInput, UpdateAccountEmailInput, UpdateAccountGeocodeInput, UpdateAccountIdentityInput, UpdateFarmGeocodeInput, UpdateFarmIdentityInput, VegetableCreateInput } from '../../Topology/Figures/InputTypes';
import { ErrorList } from '../../Topology/Figures/ObjectTypes';
import Directive from './Directive';
import Schema from './Schema';

const formatYupError = (err: ValidationError): ErrorList[] => {
    const errors: ErrorList[] = [];
    err.inner.forEach(e => {
        errors.push({
            path: e.path,
            message: e.message
        });
    });

    return errors;
};

const GraphValidate = {
    SignUpPublic: async (data: SignUpAccountInput): Promise<ErrorList[] | null> => {
        try {
            await Schema.sign_up_account.validate(data, { abortEarly: false });

            const username_exists = await Account.findOne({ where: { username: data.username } })
            if (username_exists) {
                return [
                    {
                        path: "username",
                        message: Directive.usernameDuplicate
                    }
                ];
            }

            const email_exists = await Account.findOne({ where: { email: data.email } })
            if (email_exists) {
                return [
                    {
                        path: "email",
                        message: Directive.emailDuplicate
                    }
                ];
            }
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    SignUpFarm: async (data: SignUpFarmInput): Promise<ErrorList[] | null> => {
        try {
            await Schema.sign_up_farm.validate(data, { abortEarly: false });

            const username_exists = await Account.findOne({ where: { username: data.username } })
            if (username_exists) {
                return [
                    {
                        path: "username",
                        message: Directive.usernameDuplicate
                    }
                ];
            }

            const email_exists = await Account.findOne({ where: { email: data.email } })
            if (email_exists) {
                return [
                    {
                        path: "email",
                        message: Directive.emailDuplicate
                    }
                ];
            }
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    Login: async (data: LoginInput): Promise<ErrorList[] | null> => {
        try {
            await Schema.login.validate(data, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    ChangePassword: async (password: string): Promise<ErrorList[] | null> => {
        try {
            await Schema.change_password.validate(password, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },


    UpdateAccountIdentity: async (data: UpdateAccountIdentityInput): Promise<ErrorList[] | null> => {
        try {
            await Schema.update_account_identity.validate(data, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    UpdateAccountEmail: async (data: UpdateAccountEmailInput): Promise<ErrorList[] | null> => {
        try {
            await Schema.update_account_email.validate(data, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    UpdateAccountGeocode: async (data: UpdateAccountGeocodeInput): Promise<ErrorList[] | null> => {
        try {
            await Schema.update_account_geocode.validate(data, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    UpdateFarmIdentity: async (data: UpdateFarmIdentityInput): Promise<ErrorList[] | null> => {
        if (!data.farm_name) {
            return [
                {
                    path: "ValidateUpdateFarm",
                    message: "A farm name is required"
                }
            ];
        }

        if (data.farm_name.length <= 3) {
            return [
                {
                    path: "ValidateUpdateFarm",
                    message: "A farm name must be at least 4 characters"
                }
            ];
        }
        return null;
    },

    UpdateFarmGeocode: async (data: UpdateFarmGeocodeInput): Promise<ErrorList[] | null> => {
        if (!data.geocode.geolocation) {
            return [
                {
                    path: "ValidateUpdateFarm",
                    message: "A geocode must contain a geolocation pair"
                }
            ];
        }
        return null;
    },



    CreateVegetable: async (data: VegetableCreateInput): Promise<ErrorList[] | null> => {
        if (!data.index) {
            return [
                {
                    path: "ValidateVegetableCreate",
                    message: "No botanical index provided."
                }
            ];
        }
        return null;
    },

}



export default GraphValidate;