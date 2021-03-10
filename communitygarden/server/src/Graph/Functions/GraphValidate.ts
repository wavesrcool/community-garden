import "reflect-metadata";
import ValidationError from 'yup/lib/ValidationError';
import { Account } from "../Topology/Atlas/Account";
import { SignUpPublicInput, SignUpFarmInput, UpdateAccountEmailInput, UpdateAccountGeocodeInput, UpdateAccountIdentityInput, UpdateFarmIdentityInput, VegetableCreateInput, QuantityMapCreateInput, ListAddInput, DualCredential } from '../Topology/Figures/InputTypes';
import { ErrorList } from '../Topology/Figures/ObjectTypes';
import Validation from "@cg/common"
import { VegetableName } from "../Topology/Figures/EnumTypes";



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
    SignUpPublic: async (data: SignUpPublicInput): Promise<ErrorList[] | null> => {
        try {
            await Validation.sign_up_account.validate(data, { abortEarly: false });

            const username_duplicate = await Account.findOne({ where: { username: data.username } })
            if (username_duplicate) {
                return [
                    {
                        path: "username",
                        message: Validation.directives.usernameDuplicate
                    }
                ];
            }

            const email_duplicate = await Account.findOne({ where: { email: data.email } })
            if (email_duplicate) {
                return [
                    {
                        path: "email",
                        message: Validation.directives.emailDuplicate
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
            await Validation.sign_up_farm.validate(data, { abortEarly: false });

            const username_duplicate = await Account.findOne({ where: { username: data.username } })
            if (username_duplicate) {
                return [
                    {
                        path: "username",
                        message: Validation.directives.usernameDuplicate
                    }
                ];
            }

            const email_duplicate = await Account.findOne({ where: { email: data.email } })
            if (email_duplicate) {
                return [
                    {
                        path: "email",
                        message: Validation.directives.emailDuplicate
                    }
                ];
            }
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    Login: async (data: DualCredential): Promise<ErrorList[] | null> => {
        try {
            await Validation.login.validate(data, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    ChangePassword: async (password: string): Promise<ErrorList[] | null> => {
        try {
            await Validation.change_password.validate(password, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },


    UpdateAccountIdentity: async (data: UpdateAccountIdentityInput): Promise<ErrorList[] | null> => {
        try {
            await Validation.update_account_identity.validate(data, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    UpdateAccountEmail: async (data: UpdateAccountEmailInput): Promise<ErrorList[] | null> => {
        try {
            await Validation.update_account_email.validate(data, { abortEarly: false });
            return null;
        } catch (err) {
            return formatYupError(err);
        }
    },

    UpdateAccountGeocode: async (data: UpdateAccountGeocodeInput): Promise<ErrorList[] | null> => {
        try {
            await Validation.update_account_geocode.validate(data, { abortEarly: false });
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

    /*
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
    },*/



    CreateVegetable: async (data: VegetableCreateInput): Promise<ErrorList[] | null> => {
        if (!data) {
            return [
                {
                    path: "VegetableCreateInput",
                    message: `data: ${data}`
                }
            ];
        }

        if (data.name == VegetableName.OTHER) {
            if (!data.other_name) {
                return [
                    {
                        path: "VegetableCreateInput",
                        message: "Please specify the kind of vegetable"
                    }
                ];
            }
        }
        return null;
    },

    CreateVegetableQuantityMap: async (data: QuantityMapCreateInput): Promise<ErrorList[] | null> => {
        if (!data) {
            return [
                {
                    path: "QuantityMapInput",
                    message: "No input recieved"
                }
            ];
        }
        return null;
    },

    ListAdd: async (data: ListAddInput): Promise<ErrorList[] | null> => {
        if (!data) {
            return [
                {
                    path: "ListAdd",
                    message: "No input recieved"
                }
            ];
        }
        return null;
    }

}

export default GraphValidate;