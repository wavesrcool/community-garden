import * as yup from 'yup'

const Directives = {
    firstNameTooShort: "A first name must be more than 1 character",
    firstNameTooLong: "Please use a more concise first name",

    lastNameTooShort: "A last name must be more than 1 character",
    lastNameTooLong: "Please use a more concise last name",
    birthdateInvalid: "Please enter a valid birth date: yyyy-mm-dd",

    usernameTooShort: "A username must be at least 3 characters",
    usernameTooLong: "A username must be less than 20 characters",

    emailTooShort: "An email must be at least 3 characters",
    emailTooLong: "An email must be less than 100 characters",
    emailInvalid: "Please use a valid email",

    passwordTooShort: "A password must be at least 8 characters",
    passwordTooLong: "A password must be less than 255 characters",


    usernameDuplicate: "An account with this username already exists",
    emailDuplicate: "This email is already registered",

    latInvalid: "Please enter a latitude",
    lngInvalid: "Please enter a longitude",
}

const Validation = {
    sign_up_account: yup.object(
        {
            first_name: yup.string().min(1, Directives.firstNameTooShort).max(50, Directives.firstNameTooLong).required(),
            last_name: yup.string().min(1, Directives.lastNameTooShort).max(50, Directives.lastNameTooLong).required(),
            birth_date: yup.string().min(8, Directives.birthdateInvalid).max(20, Directives.birthdateInvalid).required(),
            email: yup.string().min(3, Directives.emailTooShort).max(100, Directives.emailTooLong).email(Directives.emailInvalid).required(),
            username: yup.string().min(3, Directives.usernameTooShort).max(50, Directives.usernameTooLong).required(),
            password: yup.string().min(8,).max(255).required(),
            geocode: yup.object({
                lat: yup.number().required(Directives.latInvalid),
                lng: yup.number().required(Directives.lngInvalid),
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
                lat: yup.number().required(Directives.latInvalid),
                lng: yup.number().required(Directives.lngInvalid),
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
                lat: yup.number().required(Directives.latInvalid),
                lng: yup.number().required(Directives.lngInvalid),
            })
        }
    ),

    directives: Directives,

}

export default Validation;