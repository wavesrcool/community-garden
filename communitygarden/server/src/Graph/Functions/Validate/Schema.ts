import * as yup from 'yup'
import Directive from './Directive';

const Schema = {
    sign_up_account: yup.object(
        {
            first_name: yup.string().min(1, Directive.firstNameTooShort).max(50, Directive.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directive.lastNameTooShort).max(50, Directive.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directive.birthdateInvalid).max(20, Directive.birthdateInvalid).required(),
            email: yup.string().min(3, Directive.emailTooShort).max(100, Directive.emailTooLong).email(Directive.emailInvalid).required(),
            username: yup.string().min(3, Directive.usernameTooShort).max(50, Directive.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
            geocode: yup.object({
                geolocation: yup.object({
                    lat: yup.number().required(Directive.latInvalid),
                    lng: yup.number().required(Directive.lngInvalid),
                })
            })
        }
    ),

    sign_up_farm: yup.object(
        {
            first_name: yup.string().min(1, Directive.firstNameTooShort).max(50, Directive.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directive.lastNameTooShort).max(50, Directive.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directive.birthdateInvalid).max(20, Directive.birthdateInvalid).required(),
            email: yup.string().min(3, Directive.emailTooShort).max(100, Directive.emailTooLong).email(Directive.emailInvalid).required(),
            username: yup.string().min(3, Directive.usernameTooShort).max(50, Directive.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
            geocode: yup.object({
                geolocation: yup.object({
                    lat: yup.number().required(Directive.latInvalid),
                    lng: yup.number().required(Directive.lngInvalid),
                })
            }),
            farm_name: yup.string().min(3, Directive.usernameTooShort).max(50, Directive.usernameTooLong).required(),
        }
    ),

    account_register: yup.object(
        {
            first_name: yup.string().min(1, Directive.firstNameTooShort).max(50, Directive.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directive.lastNameTooShort).max(50, Directive.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directive.birthdateInvalid).max(20, Directive.birthdateInvalid).required(),
            email: yup.string().min(3, Directive.emailTooShort).max(100, Directive.emailTooLong).email(Directive.emailInvalid).required(),
            username: yup.string().min(3, Directive.usernameTooShort).max(20, Directive.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
        }
    ),

    login: yup.object(
        {
            username: yup.string().min(3, Directive.usernameTooShort).max(20, Directive.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
        }
    ),

    change_password: yup.object(
        {
            password: yup.string().min(8, Directive.passwordTooShort).max(255, Directive.passwordTooLong).required(),
        }
    ),

    update_account_identity: yup.object(
        {
            first_name: yup.string().min(1, Directive.firstNameTooShort).max(50, Directive.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directive.lastNameTooShort).max(50, Directive.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directive.birthdateInvalid).max(20, Directive.birthdateInvalid).required(),
        }
    ),

    update_account_email: yup.object(
        {
            email: yup.string().min(3, Directive.emailTooShort).max(100, Directive.emailTooLong).email(Directive.emailInvalid).required(),
        }
    ),

    update_account_geocode: yup.object(
        {
            geocode: yup.object({
                geolocation: yup.object({
                    lat: yup.number().required(Directive.latInvalid),
                    lng: yup.number().required(Directive.lngInvalid),
                })
            })
        }
    ),
}

export default Schema;