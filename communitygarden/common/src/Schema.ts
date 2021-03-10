/*import * as yup from 'yup'
import Directives from './Directives';

const Schema = {
    sign_up_account: yup.object(
        {
            first_name: yup.string().min(1, Directives.firstNameTooShort).max(50, Directives.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directives.lastNameTooShort).max(50, Directives.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directives.birthdateInvalid).max(20, Directives.birthdateInvalid).required(),
            email: yup.string().min(3, Directives.emailTooShort).max(100, Directives.emailTooLong).email(Directives.emailInvalid).required(),
            username: yup.string().min(3, Directives.usernameTooShort).max(50, Directives.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
            geocode: yup.object({
                geolocation: yup.object({
                    lat: yup.number().required(Directives.latInvalid),
                    lng: yup.number().required(Directives.lngInvalid),
                })
            })
        }
    ),

    sign_up_farm: yup.object(
        {
            first_name: yup.string().min(1, Directives.firstNameTooShort).max(50, Directives.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directives.lastNameTooShort).max(50, Directives.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directives.birthdateInvalid).max(20, Directives.birthdateInvalid).required(),
            email: yup.string().min(3, Directives.emailTooShort).max(100, Directives.emailTooLong).email(Directives.emailInvalid).required(),
            username: yup.string().min(3, Directives.usernameTooShort).max(50, Directives.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
            geocode: yup.object({
                geolocation: yup.object({
                    lat: yup.number().required(Directives.latInvalid),
                    lng: yup.number().required(Directives.lngInvalid),
                })
            }),
            farm_name: yup.string().min(3, Directives.usernameTooShort).max(50, Directives.usernameTooLong).required(),
        }
    ),

    account_register: yup.object(
        {
            first_name: yup.string().min(1, Directives.firstNameTooShort).max(50, Directives.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directives.lastNameTooShort).max(50, Directives.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directives.birthdateInvalid).max(20, Directives.birthdateInvalid).required(),
            email: yup.string().min(3, Directives.emailTooShort).max(100, Directives.emailTooLong).email(Directives.emailInvalid).required(),
            username: yup.string().min(3, Directives.usernameTooShort).max(20, Directives.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
        }
    ),

    login: yup.object(
        {
            username: yup.string().min(3, Directives.usernameTooShort).max(20, Directives.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
        }
    ),

    change_password: yup.object(
        {
            password: yup.string().min(8, Directives.passwordTooShort).max(255, Directives.passwordTooLong).required(),
        }
    ),

    update_account_identity: yup.object(
        {
            first_name: yup.string().min(1, Directives.firstNameTooShort).max(50, Directives.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directives.lastNameTooShort).max(50, Directives.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directives.birthdateInvalid).max(20, Directives.birthdateInvalid).required(),
        }
    ),

    update_account_email: yup.object(
        {
            email: yup.string().min(3, Directives.emailTooShort).max(100, Directives.emailTooLong).email(Directives.emailInvalid).required(),
        }
    ),

    update_account_geocode: yup.object(
        {
            geocode: yup.object({
                geolocation: yup.object({
                    lat: yup.number().required(Directives.latInvalid),
                    lng: yup.number().required(Directives.lngInvalid),
                })
            })
        }
    ),
}

export default Schema;*/